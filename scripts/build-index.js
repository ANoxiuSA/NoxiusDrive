// scripts/build-index.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "public");
const ALLOWED = ["documents", "music", "pictures", "videos"];

function walk(relDir) {
  const absDir = path.join(ROOT, relDir);
  const entries = fs.readdirSync(absDir, { withFileTypes: true });

  const items = [];
  for (const e of entries) {
    if (e.name === ".DS_Store") continue;

    const relPath = path.posix.join(relDir, e.name);
    const absPath = path.join(ROOT, relPath);

    const isDir = e.isDirectory();
    const stat = fs.statSync(absPath);

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

  // folders first, then name
  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

const tree = {};
for (const top of ALLOWED) {
  const abs = path.join(ROOT, top);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  tree[top] = walk(top);
}

const out = {
  generatedAt: Date.now(),
  roots: ALLOWED,
  tree
};

fs.writeFileSync(path.join(ROOT, "_index.json"), JSON.stringify(out, null, 2));
console.log("Wrote public/_index.json");
