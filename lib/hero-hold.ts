// Runs inline before the hero is painted. On devices that will play the
// dithered intro it hides the photo (html.hero-hold) so the visitor sees
// pixels first, then the clear photo; never a clear photo turning to pixels.
// Mirrors lib/shader-budget.ts (minus the renderer probe, which the client
// re-checks and releases on). Without waiting for the app bundle it releases
// when the photo loads: at once if that took over 2s (slow connection, skip
// the intro), else after 1.1s at most; and after 3s in any case.
export const HERO_HOLD_CLASS = "hero-hold";

export const heroHoldScript = `(function(){try{var d=document.documentElement,n=navigator,c=n.connection;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||"")))return;
if(n.deviceMemory&&n.deviceMemory<4)return;
var g=document.createElement("canvas").getContext("webgl2");if(!g)return;
var l=g.getExtension("WEBGL_lose_context");l&&l.loseContext();
d.classList.add("${HERO_HOLD_CLASS}");
var r=function(){d.classList.remove("${HERO_HOLD_CLASS}")};
document.addEventListener("load",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("hero-photo"))setTimeout(r,performance.now()>2000?0:1100)},true);
setTimeout(r,3000)}catch(e){}})()`;

export function releaseHeroHold() {
  document.documentElement.classList.remove(HERO_HOLD_CLASS);
}

export function isHeroHeld() {
  return document.documentElement.classList.contains(HERO_HOLD_CLASS);
}
