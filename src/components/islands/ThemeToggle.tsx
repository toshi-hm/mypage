import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset["theme"] === "dark") {
    return "dark";
  }
  return "light";
}

/**
 * ライト / ダークテーマを切り替える island。
 * 選択結果は localStorage に保存し、BaseLayout のインラインスクリプトが初期適用する。
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "ダークテーマに切り替え" : "ライトテーマに切り替え"}
      title={next === "dark" ? "ダークテーマに切り替え" : "ライトテーマに切り替え"}
      style={{
        background: "transparent",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "0.35rem 0.6rem",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: 1,
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
