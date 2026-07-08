// ヒーロー背景「インクの粒子」。island から動的 import される想定で、
// Three.js をメインバンドルに含めないことが前提(docs/design-hero-visual.md)。
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const PARTICLE_COUNT = 400;

const vertexShader = /* glsl */ `
	uniform float uTime;
	uniform vec2 uPointer;
	attribute float aScale;
	attribute float aSpeed;
	varying float vAlpha;

	void main() {
		vec3 p = position;
		// ゆっくり漂う(粒子ごとに位相をずらす)
		p.x += sin(uTime * aSpeed + p.y * 2.0) * 0.18;
		p.y += cos(uTime * aSpeed * 0.8 + p.x * 1.5) * 0.14;
		// ポインタからそっと逃げる
		vec2 d = p.xy - uPointer;
		float dist = max(length(d), 0.001);
		p.xy += normalize(d) * 0.08 / (1.0 + dist * 6.0);

		vec4 mv = modelViewMatrix * vec4(p, 1.0);
		gl_Position = projectionMatrix * mv;
		gl_PointSize = aScale * 3.4 * (1.0 / -mv.z);
		vAlpha = smoothstep(2.2, 0.4, length(p.xy));
	}
`;

const fragmentShader = /* glsl */ `
	uniform vec3 uColor;
	varying float vAlpha;

	void main() {
		// 柔らかい円形の点(インクの滲み)
		float d = length(gl_PointCoord - 0.5);
		float alpha = smoothstep(0.5, 0.12, d) * vAlpha * 0.55;
		gl_FragColor = vec4(uColor, alpha);
	}
`;

function accentColor(): Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
  try {
    return new Color(raw || "#0f3ac0");
  } catch {
    return new Color("#0f3ac0");
  }
}

// WebGL 対応を「静かに」判定する。THREE.WebGLRenderer に非対応環境で触れると
// console.error が出て Lighthouse の errors-in-console 監査に落ちるため、
// 先に canvas.getContext で確認する(null が返るだけでエラーは出ない)
function probeWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  } catch {
    return null;
  }
}

/**
 * ヒーロー背景の Three.js シーンをマウントする。
 * 失敗時(WebGL 不可など)は何もせず noop cleanup を返す。
 */
export function mountHeroScene(container: HTMLElement): () => void {
  const probe = probeWebGLContext();
  if (!probe) return () => {};
  probe.getExtension("WEBGL_lose_context")?.loseContext();

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
  } catch {
    return () => {};
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 10);
  camera.position.z = 3;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const scales = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4.4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    scales[i] = 0.4 + Math.random() * 1.6;
    speeds[i] = 0.15 + Math.random() * 0.45;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new BufferAttribute(scales, 1));
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: { x: 10, y: 10 } },
      uColor: { value: accentColor() },
    },
  });
  scene.add(new Points(geometry, material));

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  const clock = new Clock();
  let frame = 0;
  let running = true;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const tick = () => {
    if (!running) return;
    material.uniforms["uTime"]!.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };

  const setRunning = (next: boolean) => {
    if (running === next) return;
    running = next;
    if (next) {
      clock.start();
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
    }
  };

  // タブ非表示・ビューポート外では描画を止める(電力・CPU 予算)
  const onVisibility = () => setRunning(document.visibilityState === "visible");
  const observer = new IntersectionObserver(([entry]) => setRunning(entry?.isIntersecting ?? true));
  const onPointer = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    material.uniforms["uPointer"]!.value = { x: x * 2.2, y: y * 1.3 };
  };
  // テーマ切替(<html data-theme>)に色を追従させる
  const themeObserver = new MutationObserver(() => {
    material.uniforms["uColor"]!.value = accentColor();
  });

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", onPointer, { passive: true });
  observer.observe(container);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  frame = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointer);
    observer.disconnect();
    themeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
