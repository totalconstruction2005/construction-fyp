// src/pages/CustomDesign.tsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { useAuth } from "@features/auth";
import { createMapRequest } from "@shared/api/mapRequestService";
import { getUserFriendlyMessage } from "@shared/utils/errorHandler";
import ErrorAlert from "@shared/components/ErrorAlert";

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  plotSize: string;
  plotUnit: "Marla" | "Sqft" | "Kanal";
  dimensions: string;
  facing: string;
  plotType: string;
  cornerPlot: "Yes" | "No" | "";
  bedrooms: number | "";
  washrooms: number | "";
  kitchens: number | "";
  carPorch: "Yes" | "No" | "";
  tvLounge: "Yes" | "No" | "";
  drawingRoom: "Yes" | "No" | "";
  storeRoom: "Yes" | "No" | "";
  lawn: "Yes" | "No" | "";
  terrace: "Yes" | "No" | "";
  notes: string;
  uploads: File[];
  sketchDataUrl?: string; // base64 from whiteboard
};

const initialState: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  plotSize: "",
  plotUnit: "Marla",
  dimensions: "",
  facing: "",
  plotType: "",
  cornerPlot: "",
  bedrooms: "",
  washrooms: "",
  kitchens: "",
  carPorch: "",
  tvLounge: "",
  drawingRoom: "",
  storeRoom: "",
  lawn: "",
  terrace: "",
  notes: "",
  uploads: [],
};

export default function CustomDesign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Whiteboard modal state
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  // handle form changes
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setForm((s) => ({ ...s, uploads: [...s.uploads, ...Array.from(files)] }));
  };

  const removeUpload = (index: number) => {
    setForm((s) => ({ ...s, uploads: s.uploads.filter((_, i) => i !== index) }));
  };

  // validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!form.phone.trim()) e.phone = "Please enter phone";
    if (!form.plotSize.trim()) e.plotSize = "Please enter plot size";
    // simple phone/email checks (optional)
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setSubmitting(true);

    try {
      // Convert form data to match backend API expectations
      const requestData = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        plotSize: form.plotSize,
        plotUnit: form.plotUnit,
        dimensions: form.dimensions,
        facing: form.facing,
        plotType: form.plotType,
        cornerPlot: form.cornerPlot === "Yes" ? true : form.cornerPlot === "No" ? false : undefined,
        bedrooms: form.bedrooms === "" ? undefined : String(form.bedrooms),
        washrooms: form.washrooms === "" ? undefined : String(form.washrooms),
        kitchens: form.kitchens === "" ? undefined : String(form.kitchens),
        carPorch: form.carPorch === "Yes" ? true : form.carPorch === "No" ? false : undefined,
        tvLounge: form.tvLounge === "Yes" ? true : form.tvLounge === "No" ? false : undefined,
        drawingRoom: form.drawingRoom === "Yes" ? true : form.drawingRoom === "No" ? false : undefined,
        storeRoom: form.storeRoom === "Yes" ? true : form.storeRoom === "No" ? false : undefined,
        lawn: form.lawn === "Yes" ? true : form.lawn === "No" ? false : undefined,
        terrace: form.terrace === "Yes" ? true : form.terrace === "No" ? false : undefined,
        notes: form.notes,
        uploads: [], // File upload will be handled in future
        sketchDataUrl: form.sketchDataUrl,
      };

      await createMapRequest(requestData, form.uploads);
      
      // Success - navigate to My Map Requests page
      navigate("/design-studio/my-requests");
    } catch (error) {
      const message = getUserFriendlyMessage(error);
      setApiError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />
      <div className="h-16" aria-hidden />

      <main className="w-full flex-grow px-4 pb-12">
        <div className="max-w-4xl mx-auto">

          {/* Error Alert */}
          {apiError && (
            <div className="mb-6">
              <ErrorAlert message={apiError} onClose={() => setApiError(null)} />
            </div>
          )}

          {/* Header / Title */}
          <div className="mb-6">
            <nav className="text-xs text-gray-600 mb-2">
              <ol className="flex items-center gap-2">
                <li className="hover:text-emerald-700 cursor-pointer" onClick={() => navigate("/")}>Home</li>
                <li className="text-gray-400">/</li>
                <li className="hover:text-emerald-700 cursor-pointer" onClick={()=>navigate("/design-studio")}>Design Studio</li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-800 font-medium">Custom Design</li>
              </ol>
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Request a Custom House Map Design</h1>
            <p className="text-gray-600 mt-2">
              Share your plot details and preferences. Upload sketches or tap <strong>Sketch</strong> to draw directly.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* BASIC INFO */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Info</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={`mt-1 block w-full rounded-md border p-2 text-sm placeholder:text-gray-400 ${errors.name ? "border-red-500" : "border-gray-200"}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={`mt-1 block w-full rounded-md border p-2 text-sm placeholder:text-gray-400 ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                    placeholder="+92 3xx xxx xxxx"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`mt-1 block w-full rounded-md border p-2 text-sm placeholder:text-gray-400 ${errors.email ? "border-red-500" : "border-gray-200"}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200 placeholder:text-gray-400"
                    placeholder="Lahore"
                  />
                </div>
              </div>
            </section>

            {/* PLOT DETAILS */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Plot Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plot size (number) *</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={form.plotSize}
                      onChange={(e) => update("plotSize", e.target.value)}
                      className={`flex-1 rounded-md border p-2 text-sm placeholder:text-gray-400 ${errors.plotSize ? "border-red-500" : "border-gray-200"}`}
                      placeholder="3 or 1125"
                    />
                    <select
                      value={form.plotUnit}
                      onChange={(e) => update("plotUnit", e.target.value as FormState["plotUnit"])}
                      className="rounded-md border p-2 text-sm border-gray-200"
                    >
                      <option>Marla</option>
                      <option>Sqft</option>
                      <option>Kanal</option>
                    </select>
                  </div>
                  {errors.plotSize && <p className="text-xs text-red-500 mt-1">{errors.plotSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dimensions (Front × Depth)</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => update("dimensions", e.target.value)}
                    className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200 placeholder:text-gray-400"
                    placeholder="25ft × 45ft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Facing direction</label>
                  <select
                    value={form.facing}
                    onChange={(e) => update("facing", e.target.value)}
                    className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200"
                  >
                    <option value="">Select</option>
                    <option>North</option>
                    <option>South</option>
                    <option>East</option>
                    <option>West</option>
                    <option>North-East</option>
                    <option>North-West</option>
                    <option>South-East</option>
                    <option>South-West</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Plot type</label>
                  <select
                    value={form.plotType}
                    onChange={(e) => update("plotType", e.target.value)}
                    className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200"
                  >
                    <option value="">Select</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Mixed Use</option>
                    <option>Corner Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Corner plot?</label>
                  <div className="mt-1 flex gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="corner" checked={form.cornerPlot === "Yes"} onChange={() => update("cornerPlot", "Yes")} />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="corner" checked={form.cornerPlot === "No"} onChange={() => update("cornerPlot", "No")} />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* ROOMS & LAYOUT */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Rooms & Layout</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input type="number" min={0} value={form.bedrooms === "" ? "" : form.bedrooms} onChange={(e) => update("bedrooms", e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Washrooms</label>
                  <input type="number" min={0} value={form.washrooms === "" ? "" : form.washrooms} onChange={(e) => update("washrooms", e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kitchens</label>
                  <input type="number" min={0} value={form.kitchens === "" ? "" : form.kitchens} onChange={(e) => update("kitchens", e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200" />
                </div>

                {/* yes/no grid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Car porch</label>
                  <select value={form.carPorch} onChange={(e) => update("carPorch", e.target.value as FormState["carPorch"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">TV lounge</label>
                  <select value={form.tvLounge} onChange={(e) => update("tvLounge", e.target.value as FormState["tvLounge"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Drawing room</label>
                  <select value={form.drawingRoom} onChange={(e) => update("drawingRoom", e.target.value as FormState["drawingRoom"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Store room</label>
                  <select value={form.storeRoom} onChange={(e) => update("storeRoom", e.target.value as FormState["storeRoom"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lawn</label>
                  <select value={form.lawn} onChange={(e) => update("lawn", e.target.value as FormState["lawn"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Terrace</label>
                  <select value={form.terrace} onChange={(e) => update("terrace", e.target.value as FormState["terrace"])} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200">
                    <option value="">No preference</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Notes / Special Requirements</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} className="mt-1 block w-full rounded-md border p-2 text-sm border-gray-200 placeholder:text-gray-400" placeholder="e.g. master on ground floor, separate kitchen entry..." />
              </div>
            </section>

            {/* UPLOADS & SKETCH */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sketch & Uploads</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference images / drawings</label>
                  <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} className="mt-2" />
                  {form.uploads.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {form.uploads.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <span className="truncate max-w-xs">{f.name}</span>
                          <button type="button" onClick={() => removeUpload(i)} className="text-xs text-red-600 hover:underline">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sketch (draw)</label>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setIsWhiteboardOpen(true)} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-md">Open Sketchboard</button>
                    <button type="button" onClick={() => { update("sketchDataUrl", ""); alert("Cleared saved sketch (if any)."); }} className="bg-gray-100 border border-gray-200 text-sm px-3 py-2 rounded-md">Clear saved sketch</button>
                  </div>

                  {form.sketchDataUrl && (
                    <div className="mt-3 border rounded p-2">
                      <div className="text-xs text-gray-500 mb-2">Saved sketch preview</div>
                      <img src={form.sketchDataUrl} alt="sketch preview" className="w-full h-36 object-contain border rounded" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" disabled={submitting} className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md shadow text-sm">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>

              <button type="button" onClick={() => { setForm(initialState); setErrors({}); }} className="w-full sm:w-auto bg-white border border-gray-200 px-4 py-2 rounded-md text-sm">
                Reset
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {/* WHITEBOARD MODAL */}
      {isWhiteboardOpen && <WhiteboardModal
        initialDataUrl={form.sketchDataUrl}
        onClose={(dataUrl) => { setIsWhiteboardOpen(false); if (dataUrl) update("sketchDataUrl", dataUrl); }}
      />}
    </div>
  );
}

/* ---------- Whiteboard Modal Component ---------- */
/* Simple canvas drawing tool with touch/mouse support, clear, undo, save */
function WhiteboardModal({ initialDataUrl, onClose }: { initialDataUrl?: string; onClose: (dataUrl?: string) => void; }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#111827");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [, setHistory] = useState<string[]>([]); // store dataUrls for undo

  // initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth * devicePixelRatio;
      canvas.height = parent.clientHeight * devicePixelRatio;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;

      // if initial image, draw it
      if (initialDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
          ctx.drawImage(img, 0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
          pushHistory();
        };
        img.src = initialDataUrl;
      } else {
        ctx.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
        pushHistory();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPointer = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if (e instanceof TouchEvent) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left), y: (t.clientY - rect.top) };
    }
    const me = e as MouseEvent;
    return { x: (me.clientX - rect.left), y: (me.clientY - rect.top) };
  };

  const begin = (e: React.MouseEvent | React.TouchEvent) => {
    drawingRef.current = true;
    lastRef.current = getPointer((e.nativeEvent as unknown) as MouseEvent | TouchEvent);
    const ctx = ctxRef.current!;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getPointer((e.nativeEvent as unknown) as MouseEvent | TouchEvent);
    const ctx = ctxRef.current!;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    ctxRef.current?.closePath();
    pushHistory();
  };

  const pushHistory = () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png");
    setHistory((h) => {
      const next = [...h, data];
      // keep history short
      if (next.length > 50) next.shift();
      return next;
    });
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length <= 1) {
        // clear
        const ctx = ctxRef.current!;
        ctx.clearRect(0, 0, canvasRef.current!.width / devicePixelRatio, canvasRef.current!.height / devicePixelRatio);
        return [];
      }
      const next = h.slice(0, -1);
      const last = next[next.length - 1];
      const img = new Image();
      img.onload = () => {
        const ctx = ctxRef.current!;
        ctx.clearRect(0, 0, canvasRef.current!.width / devicePixelRatio, canvasRef.current!.height / devicePixelRatio);
        ctx.drawImage(img, 0, 0, canvasRef.current!.width / devicePixelRatio, canvasRef.current!.height / devicePixelRatio);
      };
      img.src = last;
      return next;
    });
  };

  const clear = () => {
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, canvasRef.current!.width / devicePixelRatio, canvasRef.current!.height / devicePixelRatio);
    pushHistory();
  };

  const save = () => {
    const data = canvasRef.current!.toDataURL("image/png");
    onClose(data); // return data url to parent
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full h-full rounded-lg overflow-hidden flex flex-col">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3 py-1 bg-gray-100 rounded text-sm" onClick={() => { setColor("#111827"); }}>Black</button>
            <button className="px-3 py-1 bg-gray-100 rounded text-sm" onClick={() => { setColor("#d97706"); }}>Accent</button>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 p-0 border-0" />
            <label className="text-sm ml-2">Stroke</label>
            <input type="range" min={1} max={12} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="ml-2" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={undo} className="px-3 py-1 bg-gray-50 border rounded text-sm">Undo</button>
            <button type="button" onClick={clear} className="px-3 py-1 bg-gray-50 border rounded text-sm">Clear</button>
            <button type="button" onClick={() => onClose(undefined)} className="px-3 py-1 bg-white border rounded text-sm">Cancel</button>
            <button type="button" onClick={save} className="px-3 py-1 bg-emerald-700 text-white rounded text-sm">Save</button>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <div className="w-full h-full max-h-[70vh] sm:max-h-[80vh]">
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseDown={begin}
                onMouseMove={move}
                onMouseUp={end}
                onMouseLeave={end}
                onTouchStart={begin}
                onTouchMove={move}
                onTouchEnd={end}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
