import React, { useCallback, useEffect, useMemo, useState } from "react";
import ErrorAlert from "@shared/components/ErrorAlert";
import {
  activateBreakdownNode,
  createBreakdownNode,
  deleteBreakdownNode,
  getBreakdownNodes,
  getEstimatorRegions,
  reorderBreakdownNode,
  updateBreakdownNode,
  validateBreakdownTree,
  type BreakdownNode,
  type CreateNodePayload,
  type EstimatorRegion,
  type TreeNode,
} from "../../api/estimator.api";

// ---------------------------------------------------------------------------
// Pure helper: build nested tree from flat list
// ---------------------------------------------------------------------------
export const buildTree = (nodes: BreakdownNode[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  nodes.forEach((n) => {
    map.set(n._id, { ...n, children: [] });
  });
  const roots: TreeNode[] = [];
  nodes.forEach((n) => {
    const node = map.get(n._id)!;
    if (n.parentId) {
      const parent = map.get(n.parentId);
      if (parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRec = (items: TreeNode[]) => {
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    items.forEach((i) => sortRec(i.children));
  };
  sortRec(roots);
  return roots;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TOLERANCE = 0.01;
const isExact100 = (sum: number) => Math.abs(sum - 100) <= TOLERANCE;

/** Sum of all siblings, optionally excluding one node by id */
const siblingSum = (group: TreeNode[], excludeId?: string): number =>
  group.reduce(
    (acc, n) => acc + (excludeId === n._id ? 0 : (n.percentage ?? 0)),
    0,
  );

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type NodeFormState = {
  name: string;
  percentage: string;
  requiresMaterial: boolean;
  notes: string;
};

type FormErrors = Partial<Record<keyof NodeFormState, string>>;

const emptyForm: NodeFormState = {
  name: "",
  percentage: "",
  requiresMaterial: false,
  notes: "",
};

// ---------------------------------------------------------------------------
// NodeModal  (draft mode — only blocks on invalid range, not sibling sum)
// ---------------------------------------------------------------------------
type NodeModalProps = {
  editingNode: BreakdownNode | null;
  modalParentId: string | null;
  siblingNodes: TreeNode[];
  form: NodeFormState;
  formErrors: FormErrors;
  saving: boolean;
  onChange: (form: NodeFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

const NodeModal: React.FC<NodeModalProps> = ({
  editingNode,
  modalParentId,
  siblingNodes,
  form,
  formErrors,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  const title = editingNode
    ? "Edit Node"
    : modalParentId
      ? "Add Child Node"
      : "Add Root Node";
  const pct = parseFloat(form.percentage);
  const othersSum = siblingSum(siblingNodes, editingNode?._id);
  const remaining = +(100 - othersSum).toFixed(2);
  const prospectiveTotal = isFinite(pct)
    ? +(othersSum + pct).toFixed(2)
    : othersSum;
  const totalOk = isFinite(pct) && isExact100(prospectiveTotal);
  const totalOver = isFinite(pct) && prospectiveTotal > 100 + TOLERANCE;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingNode
                ? "Update this breakdown node."
                : "Add a new breakdown node."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Foundation & Structure"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="any"
              value={form.percentage}
              onChange={(e) =>
                onChange({ ...form, percentage: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 35"
            />
            {formErrors.percentage && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.percentage}
              </p>
            )}

            {/* Remaining + prospective total info */}
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
              <span
                className={
                  remaining < 0 ? "text-red-500 font-medium" : "text-gray-500"
                }
              >
                Remaining at this level:{" "}
                <strong
                  className={
                    remaining >= 0 ? "text-emerald-600" : "text-red-500"
                  }
                >
                  {remaining}%
                </strong>
              </span>
              {isFinite(pct) && (
                <span
                  className={
                    totalOk
                      ? "text-emerald-600 font-medium"
                      : totalOver
                        ? "text-red-500 font-medium"
                        : "text-amber-500 font-medium"
                  }
                >
                  Children total after save:{" "}
                  <strong>{prospectiveTotal}%</strong>
                  {totalOk
                    ? " ✓"
                    : totalOver
                      ? " (exceeds 100%)"
                      : " (incomplete — OK in draft)"}
                </span>
              )}
            </div>
          </div>

          {/* Requires Material */}
          <div className="flex items-center gap-2">
            <input
              id="requiresMaterial"
              type="checkbox"
              checked={form.requiresMaterial}
              onChange={(e) =>
                onChange({ ...form, requiresMaterial: e.target.checked })
              }
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
            />
            <label
              htmlFor="requiresMaterial"
              className="text-sm font-medium text-gray-700"
            >
              Requires Material (excluded from "Without Material" mode)
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingNode
                  ? "Update Node"
                  : "Save (Draft)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TreeNodeRow (recursive)
// ---------------------------------------------------------------------------
type TreeNodeRowProps = {
  node: TreeNode;
  siblings: TreeNode[];
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: BreakdownNode) => void;
  onDelete: (node: BreakdownNode) => void;
  onActivate: (node: BreakdownNode) => void;
  onMoveUp: (node: BreakdownNode, siblings: TreeNode[]) => void;
  onMoveDown: (node: BreakdownNode, siblings: TreeNode[]) => void;
  onDuplicate: (node: BreakdownNode) => void;
  depth?: number;
  constructionType?: "grey" | "complete";
};

const TreeNodeRow: React.FC<TreeNodeRowProps> = ({
  node,
  siblings,
  expanded,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onActivate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  depth = 0,
  constructionType = "grey",
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node._id);

  const childrenTotal = hasChildren
    ? +node.children.reduce((acc, c) => acc + (c.percentage ?? 0), 0).toFixed(2)
    : null;
  const childrenRemaining =
    childrenTotal !== null ? +(100 - childrenTotal).toFixed(2) : null;
  const childrenOk = childrenTotal !== null && isExact100(childrenTotal);
  const childrenOver =
    childrenTotal !== null && childrenTotal > 100 + TOLERANCE;

  const siblingIndex = siblings.findIndex((s) => s._id === node._id);
  const isCompleteHouseRoot = constructionType === "complete" && depth === 0;

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-gray-100 ${!node.active ? "opacity-50 bg-gray-50" : ""}`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand/Collapse */}
        <button
          type="button"
          onClick={() => onToggleExpand(node._id)}
          className={`text-gray-400 hover:text-gray-700 w-5 shrink-0 text-center ${!hasChildren ? "invisible" : ""}`}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "▾" : "▸"}
        </button>

        {/* Name + badges */}
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-800 truncate">
            {node.name}
          </span>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
            {node.percentage}%
          </span>
          {!node.active && (
            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
              Inactive
            </span>
          )}
          {/* Children total + remaining */}
          {childrenTotal !== null && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                childrenOk
                  ? "bg-emerald-50 text-emerald-600"
                  : childrenOver
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              Children total: {childrenTotal}% — Remaining: {childrenRemaining}%
              {childrenOk ? " ✓" : childrenOver ? " ⛔" : " (draft)"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onAddChild(node._id)}
            className="px-2 py-1 text-xs rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            + Child
          </button>
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>

          {!isCompleteHouseRoot && (
            <>
              <button
                type="button"
                onClick={() => onDuplicate(node)}
                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => onMoveUp(node, siblings)}
                disabled={siblingIndex <= 0}
                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(node, siblings)}
                disabled={siblingIndex >= siblings.length - 1}
                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onActivate(node)}
                className={`px-2 py-1 text-xs rounded border ${node.active ? "border-amber-300 text-amber-600 hover:bg-amber-50" : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"}`}
              >
                {node.active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(node)}
                className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child._id}
              node={child}
              siblings={node.children}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onActivate={onActivate}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              depth={depth + 1}
              constructionType={constructionType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// EstimatorBreakdownTree
// ---------------------------------------------------------------------------
const EstimatorBreakdownTree: React.FC = () => {
  const [regions, setRegions] = useState<EstimatorRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [constructionType, setConstructionType] = useState<"grey" | "complete">(
    "grey",
  );
  const [mode, setMode] = useState<"with_material" | "without_material">(
    "with_material",
  );

  const [nodes, setNodes] = useState<BreakdownNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState<BreakdownNode | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [form, setForm] = useState<NodeFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Publish validation state
  const [validating, setValidating] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null);
  const [publishOk, setPublishOk] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setRegions(await getEstimatorRegions());
      } catch {
        setError("Failed to load regions.");
      }
    };
    void load();
  }, []);

  const loadNodes = useCallback(async () => {
    if (!selectedRegion) return;
    try {
      setLoading(true);
      setError(null);
      setNodes(
        await getBreakdownNodes({
          region: selectedRegion,
          constructionType,
          mode,
        }),
      );
    } catch {
      setError("Failed to load breakdown nodes.");
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, constructionType, mode]);

  useEffect(() => {
    void loadNodes();
  }, [loadNodes]);

  // Reset publish status whenever tree changes
  useEffect(() => {
    setPublishErrors(null);
    setPublishOk(false);
  }, [nodes]);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  const getSiblingGroup = useCallback(
    (parentId: string | null): TreeNode[] => {
      if (parentId === null) return tree;
      const find = (items: TreeNode[]): TreeNode[] | null => {
        for (const item of items) {
          if (item._id === parentId) return item.children;
          const r = find(item.children);
          if (r) return r;
        }
        return null;
      };
      return find(tree) ?? [];
    },
    [tree],
  );

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openCreate = (parentId: string | null = null) => {
    setEditingNode(null);
    setModalParentId(parentId);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (node: BreakdownNode) => {
    setEditingNode(node);
    setModalParentId(null);
    setForm({
      name: node.name,
      percentage: String(node.percentage),
      requiresMaterial: node.requiresMaterial,
      notes: node.notes ?? "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNode(null);
    setModalParentId(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.name.trim()) {
      errors.name = "Name is required.";
    }

    const pct = parseFloat(form.percentage);

    if (form.percentage === "" || !isFinite(pct) || pct < 0) {
      errors.percentage = "Percentage must be 0 or greater.";
    } else if (pct > 100) {
      errors.percentage = "Percentage cannot exceed 100%.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const pct = parseFloat(form.percentage);
    try {
      setSaving(true);
      setError(null);
      if (editingNode) {
        await updateBreakdownNode(editingNode._id, {
          name: form.name.trim(),
          percentage: pct,
          requiresMaterial: form.requiresMaterial,
          notes: form.notes.trim(),
        });
      } else {
        const siblingCount = modalSiblingGroup.length;

await createBreakdownNode({
  name: form.name.trim(),
  percentage: pct,
  parentId: modalParentId,
  region: selectedRegion,
  constructionType,
  mode,
  requiresMaterial: form.requiresMaterial,
  notes: form.notes.trim(),
  order: siblingCount,
}) as CreateNodePayload;
      }
      closeModal();
      await loadNodes();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to save node.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (node: BreakdownNode) => {
    if (!window.confirm(`Delete "${node.name}" and all its children?`)) return;
    try {
      await deleteBreakdownNode(node._id);
      await loadNodes();
    } catch {
      setError("Failed to delete node.");
    }
  };

  const handleActivate = async (node: BreakdownNode) => {
    try {
      await activateBreakdownNode(node._id, !node.active);
      await loadNodes();
    } catch {
      setError("Failed to toggle activation.");
    }
  };

  const handleMoveUp = async (node: BreakdownNode, siblings: TreeNode[]) => {
    console.log("MOVE UP CLICKED", node.name, node.order);
    const idx = siblings.findIndex((s) => s._id === node._id);
    if (idx <= 0) return;
    const prev = siblings[idx - 1];
    try {
      await reorderBreakdownNode(node._id, prev.order);
      await loadNodes();
    } catch {
      setError("Failed to reorder.");
    }
  };

  const handleMoveDown = async (node: BreakdownNode, siblings: TreeNode[]) => {
    console.log("MOVE DOWN CLICKED", node.name, node.order);
    const idx = siblings.findIndex((s) => s._id === node._id);
    if (idx < 0 || idx >= siblings.length - 1) return;
    const next = siblings[idx + 1];
    console.log(
  "Current:",
  node.name,
  node.order,
  "Next:",
  next.name,
  next.order
);
    try {
      await reorderBreakdownNode(node._id, next.order);
      await loadNodes();
    } catch {
      setError("Failed to reorder.");
    }
  };

  const handleDuplicate = async (node: BreakdownNode) => {
    try {
      await createBreakdownNode({
        name: `${node.name} (Copy)`,
        percentage: node.percentage,
        parentId: node.parentId,
        region: node.region,
        constructionType: node.constructionType,
        mode: node.mode,
        requiresMaterial: node.requiresMaterial,
        notes: node.notes,
        order: node.order,
      });
      await loadNodes();
    } catch {
      setError("Failed to duplicate node.");
    }
  };

  const handleValidateTree = async () => {
    if (!selectedRegion) return;
    try {
      setValidating(true);
      setPublishErrors(null);
      setPublishOk(false);
      setError(null);
      const result = await validateBreakdownTree({
        region: selectedRegion,
        constructionType,
        mode,
      });
      if (result.success) {
        setPublishOk(true);
      } else {
        setPublishErrors(result.errors ?? [result.message]);
      }
    } catch {
      setError("Validation request failed.");
    } finally {
      setValidating(false);
    }
  };

  const modalSiblingGroup = useMemo(() => {
    if (!showModal) return [];
    return getSiblingGroup(editingNode ? editingNode.parentId : modalParentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, editingNode, modalParentId, tree]);

  const rootTotal = useMemo(
    () => +tree.reduce((acc, n) => acc + (n.percentage ?? 0), 0).toFixed(2),
    [tree],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              Estimator
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              Breakdown Tree
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Draft editing: save nodes freely. Use{" "}
              <strong>Validate &amp; Publish</strong> when all percentages are
              complete.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {constructionType !== "complete" && (
              <button
                type="button"
                onClick={() => openCreate(null)}
                disabled={!selectedRegion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
              >
                + Add Root Node
              </button>
            )}
            <button
              type="button"
              onClick={handleValidateTree}
              disabled={!selectedRegion || validating || tree.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
            >
              {validating ? "Checking..." : "Validate & Publish"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorAlert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Publish result */}
        {publishOk && (
          <div className="mt-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            ✓ Tree is valid — all sibling groups sum to 100%. Ready to use in
            the public calculator.
          </div>
        )}
        {publishErrors && publishErrors.length > 0 && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm">
            <p className="font-semibold text-red-700 mb-2">
              ⛔ Tree is not ready to publish. Fix these issues:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-red-600">
              {publishErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Construction Type
            </label>
            <div className="flex gap-2">
              {(["grey", "complete"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setConstructionType(t)}
                  className={`px-3 py-2 text-sm rounded-full border font-medium ${constructionType === t ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  {t === "grey" ? "Grey Structure" : "Complete House"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Mode
            </label>
            <div className="flex gap-2">
              {(["with_material", "without_material"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 text-sm rounded-full border font-medium ${mode === m ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  {m === "with_material" ? "With Material" : "Without Material"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Root-level total banner */}
      {selectedRegion && tree.length > 0 && (
        <div
          className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            isExact100(rootTotal)
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : rootTotal > 100 + TOLERANCE
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <span>
            Root-level — Children total: <strong>{rootTotal}%</strong> —
            Remaining: <strong>{+(100 - rootTotal).toFixed(2)}%</strong>
          </span>
          {isExact100(rootTotal) ? (
            <span>✓</span>
          ) : rootTotal > 100 + TOLERANCE ? (
            <span>⛔ exceeds 100%</span>
          ) : (
            <span>(draft)</span>
          )}
        </div>
      )}

      {/* Tree Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!selectedRegion ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Select a region and combination above to view and edit the breakdown
            tree.
          </div>
        ) : loading ? (
          <div className="p-6 text-sm text-gray-500">Loading nodes...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No nodes yet for{" "}
            <strong>
              {selectedRegion} /{" "}
              {constructionType === "grey"
                ? "Grey Structure"
                : "Complete House"}{" "}
              /{" "}
              {mode === "with_material" ? "With Material" : "Without Material"}
            </strong>
            . Click <strong>+ Add Root Node</strong> to begin.
          </div>
        ) : (
          <div>
            {tree.map((node) => (
              <TreeNodeRow
                key={node._id}
                node={node}
                siblings={tree}
                expanded={expandedIds}
                onToggleExpand={handleToggleExpand}
                onAddChild={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDuplicate={handleDuplicate}
                depth={0}
                constructionType={constructionType}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NodeModal
          editingNode={editingNode}
          modalParentId={modalParentId}
          siblingNodes={modalSiblingGroup}
          form={form}
          formErrors={formErrors}
          saving={saving}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default EstimatorBreakdownTree;
