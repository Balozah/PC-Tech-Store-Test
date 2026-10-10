// Paper Shaders (WebGL) are an enhancement only: every shader in the site sits
// on top of a static fallback that already looks finished. Skip them when the
// visitor asked for less motion, is saving data, is on a 2G-class connection,
// the device is low on memory, or WebGL is missing or software-rendered (CPU
// rasterizers like SwiftShader turn every frame into a main-thread stall).

type NetworkInformation = { saveData?: boolean; effectiveType?: string };
type DeviceHints = Navigator & { connection?: NetworkInformation; deviceMemory?: number };

let gpuOk: boolean | undefined;

function hasHardwareWebGL() {
  if (gpuOk !== undefined) return gpuOk;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (gpuOk = false);
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gpuOk = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    gpuOk = false;
  }
  return gpuOk;
}

export function canRunShaders() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as DeviceHints;
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  return hasHardwareWebGL();
}

/** Desktop-class pointer: hover effects that need a mouse stay off on phones. */
export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
