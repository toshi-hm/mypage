import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  return typeof document !== "undefined" && document.documentElement.dataset["theme"] === "dark"
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const next: Theme = theme === "light" ? "dark" : "light";
  const label = next === "dark" ? "ダークテーマに切り替え" : "ライトテーマに切り替え";
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
    </button>
  );
}
