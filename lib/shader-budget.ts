// Paper Shaders (WebGL) are an enhancement only: every shader in the site sits
// on top of a static fallback that already looks finished. Skip them when the
// visitor asked for less motion, is saving data, is on a 2G-class connection,
// or the browser can't create a WebGL context.

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

let webglSupport: boolean | undefined;

function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function canRunShaders() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return false;
  return hasWebGL();
}

/** Desktop-class pointer: hover effects that need a mouse stay off on phones. */
export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
