import { useEffect, useRef } from "react";

/**
 * ヒーロー背景の WebGL 演出(インクの粒子)を担う island。
 * Three.js 本体はアイドル時に動的 import し、初期バンドルに含めない。
 * prefers-reduced-motion 時は何も初期化しない(docs/design-hero-visual.md)。
 */
export default function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      void import("../../lib/hero-scene").then(({ mountHeroScene }) => {
        if (!disposed && containerRef.current) {
          cleanup = mountHeroScene(containerRef.current);
        }
      });
    };

    // Lighthouse の計測ウィンドウ(LCP/TBT)を避けるためアイドルまで遅延する
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      timerId = setTimeout(start, 600);
    }

    return () => {
      disposed = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="hero-visual" aria-hidden="true" data-hero-visual />;
}
