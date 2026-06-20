// MapConvertStaticImage.tsx
import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import type { WebGLRenderer } from "three";
import { MyNavbar, Footer } from "@layouts";
// static image import (adjust path as needed)
import FLOORPLAN_IMG from "@assets/map1.webp";

type BoxDef = { id: string; x: number; y: number; width: number; depth: number; height: number };

const ScenePlane: React.FC<{
  imageUrl: string;
  planeWidth: number;
  planeHeight: number;
  boxes: BoxDef[];
}> = ({ imageUrl, planeWidth, planeHeight, boxes }) => {
  const texture = useTexture(imageUrl);

  return (
    <>
      {/* textured floorplan plane (lying flat) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial map={texture} side={2} />
      </mesh>

      {/* subtle ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[planeWidth * 1.4, planeHeight * 1.4]} />
        <meshStandardMaterial color={"#fafafa"} />
      </mesh>

      {/* extruded demo boxes (walls/rooms) */}
      {boxes.map((b) => (
        <mesh key={b.id} position={[b.x, b.height / 2, -b.y]}>
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial color={"#e0a15a"} metalness={0.15} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

/* Error boundary for Canvas errors */
class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || String(error) };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Canvas error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded text-sm text-red-700">
          <strong>3D view failed to load.</strong>
          <div className="mt-2">Reason: {this.state.message}</div>
          <div className="mt-2">Try reloading the page.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MapConvertStaticImage: React.FC = () => {
  const planeWidth = 12;
  const planeHeight = 16;

  // demo extrusions (kept so the 3D view shows "rooms" / walls)
  const [boxes] = useState<BoxDef[]>([{ id: "b1", x: 0, y: 1.5, width: 3, depth: 2.5, height: 2.8 }]);

  // mode toggle: 2d (default) or 3d
  const [mode, setMode] = useState<"2d" | "3d">("2d");

  // use imported static image as the texture source
  const [imageUrl] = useState<string>(FLOORPLAN_IMG as string);

  // WebGL context lost handling
  const glRef = useRef<WebGLRenderer | null>(null);
  const [ctxLost, setCtxLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const onCreated = (state: any) => {
    glRef.current = state.gl as WebGLRenderer;
    const canvasEl: HTMLCanvasElement = state.gl.domElement;
    const onLost = (ev: Event) => {
      ev.preventDefault();
      console.warn("WebGL context lost");
      setCtxLost(true);
    };
    canvasEl.addEventListener("webglcontextlost", onLost, false);
    return () => canvasEl.removeEventListener("webglcontextlost", onLost);
  };

  // small inline placeholder if needed
  const placeholder = useMemo(
    () =>
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'><rect width='100%' height='100%' fill='#f8fafc'/><text x='50%' y='50%' font-size='20' text-anchor='middle' fill='#94a3b8'>No plan available</text></svg>`
      ),
    []
  );

  // viewer height (same for 2D and 3D)
  const viewerHeight = "min-h-[45vh] sm:min-h-[55vh] md:min-h-[65vh]";

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <MyNavbar transparent={false} />

      {/* spacer matching fixed navbar height so content is not hidden under it */}
      <div aria-hidden="true" className="h-9 sm:h-12" />

      <main className="py-6 px-4 max-w-screen-xl mx-auto">
        {/* header + mode switch */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold">Floorplan Viewer</h2>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md bg-white p-1 border">
              <button
                onClick={() => setMode("2d")}
                className={`px-3 py-1 text-sm rounded-md ${mode === "2d" ? "bg-emerald-600 text-white" : "text-gray-700"}`}
                aria-pressed={mode === "2d"}
              >
                2D
              </button>
              <button
                onClick={() => setMode("3d")}
                className={`px-3 py-1 text-sm rounded-md ${mode === "3d" ? "bg-emerald-600 text-white" : "text-gray-700"}`}
                aria-pressed={mode === "3d"}
              >
                3D
              </button>
            </div>
          </div>
        </div>

        {/* WebGL context lost warning */}
        {ctxLost && (
          <div className="mb-0 p-3 py-1 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
            WebGL context was lost.{" "}
            <button
              onClick={() => {
                setCanvasKey((k) => k + 1);
                setCtxLost(false);
              }}
              className="ml-2 text-sm underline"
            >
              Reload 3D view
            </button>
          </div>
        )}

        {/* Viewer area: show 2D image or 3D Canvas depending on mode */}
        <div className={`rounded-lg shadow overflow-hidden ${viewerHeight}`}>
          {mode === "2d" ? (
            <div className="h-full w-full bg-white flex items-center justify-center">
              <img
                src={imageUrl ?? placeholder}
                alt="Floorplan (2D)"
                className="max-h-full max-w-full object-contain"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          ) : (
            <CanvasErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading 3D…</div>}>
                <Canvas
                  key={canvasKey}
                  onCreated={onCreated}
                  camera={{ position: [0, 20, 20], fov: 45 }}
                  dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
                  gl={{ antialias: true, powerPreference: "low-power" as any }}
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[10, 20, 10]} intensity={0.8} />
                  <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
                  <ScenePlane imageUrl={imageUrl ?? placeholder} planeWidth={planeWidth} planeHeight={planeHeight} boxes={boxes} />
                </Canvas>
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>

        {/* NOTE: editor / selected box UI removed as requested */}

      </main>

      <Footer />
    </div>
  );
};

export default MapConvertStaticImage;
