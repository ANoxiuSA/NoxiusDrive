const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "public");
const ALLOWED = ["documents", "music", "pictures", "videos"];

function walk(relDir) {
  const absDir = path.join(ROOT, relDir);
  const entries = fs.readdirSync(absDir, { withFileTypes: true });

  const items = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;

    const relPath = path.posix.join(relDir, e.name);
    const absPath = path.join(ROOT, relPath);
    const stat = fs.statSync(absPath);

    const isDir = e.isDirectory();

    items.push({
      name: e.name,
      kind: isDir ? "folder" : "file",
      size: isDir ? 0 : stat.size,
      mtimeMs: stat.mtimeMs,
      relPath,
      url: `/${relPath}${isDir ? "/" : ""}`,
      children: isDir ? walk(relPath) : undefined
    });
  }

  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

const tree = {};
for (const root of ALLOWED) {
  const dir = path.join(ROOT, root);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  tree[root] = walk(root);
}

fs.writeFileSync(
  path.join(ROOT, "_index.json"),
  JSON.stringify(
    { generatedAt: Date.now(), roots: ALLOWED, tree },
    null,
    2
  )
);

console.log("public/_index.json generated");
