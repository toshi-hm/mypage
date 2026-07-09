// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import ThemeToggle from "../src/components/islands/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});

afterEach(() => {
  cleanup();
});

test("初期状態(light)では月アイコンを表示する", () => {
  render(<ThemeToggle />);

  expect(screen.getByRole("button").textContent).toBe("🌙");
  expect(document.documentElement.dataset["theme"]).toBe("light");
});

test("html の data-theme が dark なら dark で初期化される", () => {
  document.documentElement.dataset["theme"] = "dark";
  render(<ThemeToggle />);

  expect(screen.getByRole("button").textContent).toBe("☀️");
});

test("クリックでテーマが切り替わり localStorage に保存される", () => {
  render(<ThemeToggle />);
  const button = screen.getByRole("button");

  fireEvent.click(button);

  expect(document.documentElement.dataset["theme"]).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(button.textContent).toBe("☀️");

  fireEvent.click(button);

  expect(document.documentElement.dataset["theme"]).toBe("light");
  expect(localStorage.getItem("theme")).toBe("light");
});
