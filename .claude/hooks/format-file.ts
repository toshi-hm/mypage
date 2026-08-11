// PostToolUse hook: Edit/Write されたファイルに対応する formatter を自動適用する。
// stdin に hook の JSON ペイロードが渡される。
const input = (await new Response(Bun.stdin.stream()).json().catch(() => null)) as {
  tool_input?: { file_path?: string };
} | null;

const filePath = input?.tool_input?.file_path;

if (typeof filePath === "string" && /\.(astro|ts|tsx|js|jsx|mjs|cjs|json|css|md)$/.test(filePath)) {
  const formatter = filePath.endsWith(".astro") ? ["bunx", "prettier"] : ["bunx", "oxfmt"];
  Bun.spawnSync([...formatter, filePath], {
    cwd: import.meta.dir + "/../..",
    stdout: "ignore",
    stderr: "ignore",
  });
}

process.exit(0);
