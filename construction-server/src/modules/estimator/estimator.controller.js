const RegionRate = require('./region.model');
const BreakdownNode = require('./breakdown.model');
const PopularCalculation = require("./PopularCalculation.model");
const mongoose = require('mongoose');

// Unit conversion map (can be extended or moved to DB later)
const UNIT_TO_SQFT = {
  Marla: 272.25,
  Kanal: 5445,
  'Sq Yard': 9,
  'Sq Meter': 10.764,
  Acre: 43560,
  'Sq Ft': 1,
};

// Helper to automatically seed top-level sections (Grey Structure & Finishing) for Complete House
const ensureCompleteHouseTopLevelNodes = async (region, mode) => {
  let greyRoot = await BreakdownNode.findOne({
    region,
    constructionType: 'complete',
    mode,
    name: 'Grey Structure',
    parentId: null
  });
  if (!greyRoot) {
    greyRoot = await BreakdownNode.create({
      name: 'Grey Structure',
      percentage: 60,
      parentId: null,
      region,
      constructionType: 'complete',
      mode,
      order: 1,
      active: true,
    });
  }

  let finishingRoot = await BreakdownNode.findOne({
    region,
    constructionType: 'complete',
    mode,
    name: 'Finishing',
    parentId: null
  });
  if (!finishingRoot) {
    finishingRoot = await BreakdownNode.create({
      name: 'Finishing',
      percentage: 40,
      parentId: null,
      region,
      constructionType: 'complete',
      mode,
      order: 2,
      active: true,
    });
  }
};

// Helper: build nested tree from flat nodes
const buildTree = (nodes) => {
  const map = {};
  nodes.forEach(n => { map[n._id] = { ...n.toObject(), children: [] }; });
  const roots = [];
  nodes.forEach(n => {
    if (n.parentId) {
      const parent = map[n.parentId];
      if (parent) parent.children.push(map[n._id]);
    } else {
      roots.push(map[n._id]);
    }
  });
  // sort children by order
  const sortRec = (items) => {
    items.sort((a,b) => (a.order||0)-(b.order||0));
    items.forEach(i => sortRec(i.children || []));
  };
  sortRec(roots);
  return roots;
};

// Recursive amount calculation
const computeAmounts = (nodes, parentAmount) => {
  return nodes.map(node => {
    const amount = +(parentAmount * (node.percentage/100));
    const withChildren = node.children && node.children.length ? computeAmounts(node.children, amount) : [];
    return {
      _id: node._id,
      name: node.name,
      percentage: node.percentage,
      amount: +amount.toFixed(2),
      order: node.order,
      active: node.active,
      requiresMaterial: node.requiresMaterial,
      notes: node.notes || '',
      children: withChildren,
    };
  });
};

// Public: get config by region
exports.getConfig = async (req, res) => {
  try {
    const region = req.params.region;
    const config = await RegionRate.findOne({ name: region });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }

    res.json({ success: true, data: { region: config.name, rates: config.rates, unitConversions: UNIT_TO_SQFT } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get config' });
  }
};

// Public: fetch nested breakdown for region/type/mode
exports.getBreakdown = async (req, res) => {
  try {
    const { region, type, mode } = req.query;
    if (!region || !type || !mode) return res.status(400).json({ success: false, message: 'region, type and mode are required' });

    if (type === 'complete') {
      await ensureCompleteHouseTopLevelNodes(region, mode);
    }

    const nodes = await BreakdownNode.find({ region, constructionType: type, mode, active: true }).sort({ order: 1 });
    const tree = buildTree(nodes);
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch breakdown' });
  }
};

// Public: calculate estimate
exports.calculate = async (req, res) => {
  try {
    const { region, constructionType, mode, areaUnit, areaSize, coveredArea } = req.body;
    if (!region || !constructionType || !mode || !areaUnit) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (constructionType === 'complete') {
      await ensureCompleteHouseTopLevelNodes(region, mode);
    }

    const config = await RegionRate.findOne({ name: region });
    if (!config) return res.status(404).json({ success: false, message: 'Region not found' });

    // determine rate key
    const modeKey = `${constructionType === 'grey' ? 'grey' : 'complete'}_${mode === 'with_material' ? 'with_material' : 'without_material'}`;
    const ratePerSqFt = config.rates[modeKey];
    if (typeof ratePerSqFt !== 'number') return res.status(400).json({ success: false, message: 'Rate not configured' });

    // convert input area to sqft
    const unitFactor = UNIT_TO_SQFT[areaUnit] || 1;
    const originalArea = areaSize || 0;
    const areaSqft = originalArea * unitFactor;
    const billableSqft = coveredArea || areaSqft;

    const totalCost = +(billableSqft * ratePerSqFt).toFixed(2);
    const pricePerSqFt = +ratePerSqFt.toFixed(2);

    // Fetch breakdown nodes and compute amounts
    const allNodes = await BreakdownNode.find({ region, constructionType, mode }).sort({ order: 1 });
    // Filter active nodes; also for without_material remove nodes that requireMaterial === true
    const activeNodes = allNodes.filter(n => n.active && !(mode === 'without_material' && n.requiresMaterial));
    const tree = buildTree(activeNodes);
    const breakdown = computeAmounts(tree, totalCost);

    // summary cards: top-level nodes amounts
    const summary = breakdown.map(n => ({ name: n.name, amount: n.amount }));

    // chart-ready: flatten top-level for pie
    const chart = summary.map(s => ({ label: s.name, value: s.amount }));

    let split = null;
    if (constructionType === 'complete') {
      const greyNode = breakdown.find(n => n.name.trim().toLowerCase() === 'grey structure');
      const finishingNode = breakdown.find(n => n.name.trim().toLowerCase() === 'finishing');
      split = {
        grey: {
          total: greyNode ? greyNode.amount : 0,
          percentage: greyNode ? greyNode.percentage : 0,
          breakdown: greyNode ? (greyNode.children || []) : []
        },
        finishing: {
          total: finishingNode ? finishingNode.amount : 0,
          percentage: finishingNode ? finishingNode.percentage : 0,
          breakdown: finishingNode ? (finishingNode.children || []) : []
        }
      };
    }

    res.json({
      success: true,
      data: {
        region,
        constructionType,
        mode,
        originalArea,
        areaSqft,
        coveredArea: billableSqft,
        ratePerSqFt: pricePerSqFt,
        totalCost,
        pricePerSqFt,
        summary,
        breakdown,
        chart,
        split,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
};

// Admin: create/update/delete region rates
exports.createRegion = async (req, res) => {
  try {
    const { name, rates, notes } = req.body;
    if (!name || !rates) return res.status(400).json({ success: false, message: 'name and rates required' });
    // Duplicate region name guard
    const existing = await RegionRate.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ success: false, message: 'Region name already exists' });
    const region = await RegionRate.create({ name: name.trim(), rates, notes });
    res.json({ success: true, data: region });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create region' });
  }
};

exports.updateRegion = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const region = await RegionRate.findByIdAndUpdate(id, updates, { new: true });
    if (!region) return res.status(404).json({ success: false, message: 'Region not found' });
    res.json({ success: true, data: region });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update region' });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    const id = req.params.id;
    await RegionRate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Region deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete region' });
  }
};

exports.listRegions = async (req, res) => {
  try {
    const list = await RegionRate.find().sort({ name: 1 });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to list regions' });
  }
};

// Admin: Breakdown node operations
exports.listNodes = async (req, res) => {
  try {
    const { region, constructionType, mode } = req.query;
    if (constructionType === 'complete' && region && mode) {
      await ensureCompleteHouseTopLevelNodes(region, mode);
    }
    const filter = {};
    if (region) filter.region = region;
    if (constructionType) filter.constructionType = constructionType;
    if (mode) filter.mode = mode;
    const nodes = await BreakdownNode.find(filter).sort({ order: 1 });
    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to list nodes' });
  }
};

exports.createNode = async (req, res) => {
  try {
    const payload = req.body;
    // Required-field validation
    const requiredFields = ['name', 'percentage', 'region', 'constructionType', 'mode'];
    const missing = requiredFields.filter(f => payload[f] === undefined || payload[f] === null || payload[f] === '');
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }
    const pct = Number(payload.percentage);
    if (!isFinite(pct) || pct < 0) {
      return res.status(400).json({ success: false, message: 'percentage must be a non-negative number' });
    }
    if (pct > 100) {
      return res.status(400).json({ success: false, message: 'percentage cannot exceed 100' });
    }
    // Draft mode: no sibling-sum check. Siblings may be incomplete while building.
    const node = await BreakdownNode.create({ ...payload, percentage: pct });
    res.json({ success: true, data: node });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create node' });
  }
};

exports.updateNode = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Percentage validation (draft: only range check, no sibling-sum)
    if (updates.percentage !== undefined) {
      const pct = Number(updates.percentage);
      if (!isFinite(pct) || pct < 0) {
        return res.status(400).json({ success: false, message: 'percentage must be a non-negative number' });
      }
      if (pct > 100) {
        return res.status(400).json({ success: false, message: 'percentage cannot exceed 100' });
      }
      updates.percentage = pct;
    }

    // Circular reference guard
    if (updates.parentId !== undefined) {
      if (String(updates.parentId) === String(id)) {
        return res.status(400).json({ success: false, message: 'A node cannot be its own parent' });
      }
      if (updates.parentId !== null) {
        let current = await BreakdownNode.findById(updates.parentId).select('parentId');
        while (current && current.parentId) {
          if (String(current.parentId) === String(id)) {
            return res.status(400).json({ success: false, message: 'Circular reference detected' });
          }
          current = await BreakdownNode.findById(current.parentId).select('parentId');
        }
      }
    }

    // Draft mode: sibling-sum check removed. Use POST /nodes/validate for publish checks.
    const node = await BreakdownNode.findByIdAndUpdate(id, updates, { new: true });
    if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
    res.json({ success: true, data: node });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update node' });
  }
};

exports.deleteNode = async (req, res) => {
  try {
    const id = req.params.id;
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      const children = await BreakdownNode.find({ parentId: current }, '_id');
      children.forEach(c => queue.push(String(c._id)));
      await BreakdownNode.findByIdAndDelete(current);
    }
    res.json({ success: true, message: 'Node and descendants deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete node' });
  }
};

exports.reorderNode = async (req, res) => {
  try {
    const id = req.params.id;
    const { order } = req.body;

    const node = await BreakdownNode.findById(id);

    if (!node) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found" });
    }

    const oldOrder = node.order;

    if (oldOrder === order) {
      return res.json({ success: true, data: node });
    }

    const siblingFilter = {
      parentId: node.parentId,
      region: node.region,
      constructionType: node.constructionType,
      mode: node.mode,
    };

    if (order > oldOrder) {
      await BreakdownNode.updateMany(
        {
          ...siblingFilter,
          order: { $gt: oldOrder, $lte: order },
        },
        { $inc: { order: -1 } }
      );
    } else {
      await BreakdownNode.updateMany(
        {
          ...siblingFilter,
          order: { $gte: order, $lt: oldOrder },
        },
        { $inc: { order: 1 } }
      );
    }

    node.order = order;
    await node.save();

    res.json({
      success: true,
      data: node,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder node",
    });
  }
};
exports.activateNode = async (req, res) => {
  try {
    const id = req.params.id;
    const { active } = req.body;
    const node = await BreakdownNode.findByIdAndUpdate(id, { active }, { new: true });
    if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
    res.json({ success: true, data: node });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to activate node' });
  }
};

// Publish-time tree validation
exports.validateTree = async (req, res) => {
  try {
    const { region, constructionType, mode } = req.body;
    if (!region || !constructionType || !mode) {
      return res.status(400).json({ success: false, message: 'region, constructionType, and mode are required' });
    }

    const allNodes = await BreakdownNode.find({ region, constructionType, mode }).sort({ order: 1 });
    if (allNodes.length === 0) {
      return res.status(400).json({ success: false, message: 'No nodes found for this combination.' });
    }

    const errors = [];
    const TOLERANCE = 0.01;

    // 1. Percentage Range check
    allNodes.forEach(n => {
      if (n.percentage < 0 || n.percentage > 100) {
        errors.push(`Node "${n.name}" has invalid percentage: ${n.percentage}% (must be between 0% and 100%)`);
      }
    });

    // 2. Circular reference and self-parent checks
    const nodeMap = new Map(allNodes.map(n => [String(n._id), n]));
    allNodes.forEach(node => {
      if (node.parentId && String(node.parentId) === String(node._id)) {
        errors.push(`Node "${node.name}" cannot be its own parent.`);
        return;
      }
      let current = node;
      const visited = new Set([String(node._id)]);
      let cycle = false;
      while (current.parentId) {
        const parentIdStr = String(current.parentId);
        if (visited.has(parentIdStr)) {
          cycle = true;
          break;
        }
        visited.add(parentIdStr);
        const parent = nodeMap.get(parentIdStr);
        if (!parent) break;
        current = parent;
      }
      if (cycle) {
        errors.push(`Circular reference detected involving node "${node.name}".`);
      }
    });

    // 3. Complete House root constraints
    if (constructionType === 'complete') {
      const rootNodes = allNodes.filter(n => !n.parentId);
      const hasGrey = rootNodes.some(n => n.name.trim().toLowerCase() === 'grey structure');
      const hasFinishing = rootNodes.some(n => n.name.trim().toLowerCase() === 'finishing');
      if (rootNodes.length !== 2 || !hasGrey || !hasFinishing) {
        errors.push("Complete House must have exactly two top-level sections: 'Grey Structure' and 'Finishing'.");
      }
    }

    // 4. Sibling sum check
    const groups = {}; // parentId (string | 'root') -> nodes[]
    allNodes.forEach(n => {
      const key = n.parentId ? String(n.parentId) : '__root__';
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    for (const [groupKey, siblings] of Object.entries(groups)) {
      const sum = +siblings.reduce((acc, s) => acc + s.percentage, 0).toFixed(10);
      if (Math.abs(sum - 100) > TOLERANCE) {
        const label = groupKey === '__root__'
          ? 'Root level'
          : `Children of "${siblings[0]?.parentId ? (allNodes.find(n => String(n._id) === groupKey)?.name ?? groupKey) : groupKey}"`;
        errors.push(`${label}: percentages sum to ${sum.toFixed(2)}% (must be 100%)`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors, message: 'Tree is not valid for publish.' });
    }

    res.json({ success: true, message: 'Tree is valid. All sibling groups sum to 100%.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Validation failed' });
  }
};
exports.repairOrders = async (req, res) => {
  try {
    const nodes = await BreakdownNode.find({}).lean();

    const groups = {};

    nodes.forEach((node) => {
      const key =
        `${node.region}|${node.constructionType}|${node.mode}|${node.parentId || "root"}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(node);
    });

    for (const key of Object.keys(groups)) {
      const group = groups[key];

      group.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return aDate - bDate;
      });

      for (let i = 0; i < group.length; i++) {
        await BreakdownNode.findByIdAndUpdate(group[i]._id, {
          order: i,
        });
      }
    }

    res.json({
      success: true,
      message: "Orders repaired successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Repair failed",
    });
  }
};
exports.listPopularCalculations = async (req, res) => {
  try {
    const data = await PopularCalculation
      .find({})
      .sort({ displayOrder: 1 });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load popular calculations",
    });
  }
};

exports.createPopularCalculation = async (req, res) => {
  try {

    const last =
      await PopularCalculation
        .findOne({})
        .sort({ displayOrder: -1 });

    const calculation =
      await PopularCalculation.create({
        ...req.body,
        displayOrder: last
          ? last.displayOrder + 1
          : 1,
      });

    res.json({
      success: true,
      data: calculation,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to create popular calculation",
    });
  }
};
exports.updatePopularCalculation = async (req, res) => {
  try {
    const calculation =
      await PopularCalculation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: "Calculation not found",
      });
    }

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update calculation",
    });
  }
};
exports.deletePopularCalculation = async (req, res) => {
  try {
    const calculation =
      await PopularCalculation.findByIdAndDelete(
        req.params.id
      );

    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: "Calculation not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete calculation",
    });
  }
};

exports.togglePopularCalculation = async (
  req,
  res
) => {
  try {
    const calculation =
      await PopularCalculation.findById(
        req.params.id
      );

    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: "Calculation not found",
      });
    }

    calculation.isActive =
      !calculation.isActive;

    await calculation.save();

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};
exports.reorderPopularCalculation =
  async (req, res) => {
    try {
      const { displayOrder } = req.body;

      const item =
        await PopularCalculation.findById(
          req.params.id
        );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Calculation not found",
        });
      }

      const oldOrder =
        item.displayOrder;

      if (oldOrder === displayOrder) {
        return res.json({
          success: true,
          data: item,
        });
      }

      if (displayOrder > oldOrder) {
        await PopularCalculation.updateMany(
          {
            displayOrder: {
              $gt: oldOrder,
              $lte: displayOrder,
            },
          },
          {
            $inc: {
              displayOrder: -1,
            },
          }
        );
      } else {
        await PopularCalculation.updateMany(
          {
            displayOrder: {
              $gte: displayOrder,
              $lt: oldOrder,
            },
          },
          {
            $inc: {
              displayOrder: 1,
            },
          }
        );
      }

      item.displayOrder =
        displayOrder;

      await item.save();

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to reorder",
      });
    }
  };
  exports.listActivePopularCalculations =
  async (req, res) => {
    try {
      const data =
        await PopularCalculation.find({
          isActive: true,
        }).sort({
          displayOrder: 1,
        });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to load calculations",
      });
    }
  };