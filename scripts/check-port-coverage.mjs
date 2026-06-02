import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceRoot = path.resolve(projectRoot, "..");
const modules = [
  "miuix-core",
  "miuix-ui",
  "miuix-preference",
  "miuix-blur",
  "miuix-icons",
  "miuix-navigation3-ui",
  "miuix-shader",
  "miuix-squircle",
];

const sourceNames = new Map();

for (const moduleName of modules) {
  const modulePath = path.join(sourceRoot, moduleName);
  if (!exists(modulePath)) continue;
  for (const file of walk(modulePath)) {
    if (!file.endsWith(".kt")) continue;
    const text = readFileSync(file, "utf8");
    collect(text, /^fun\s+(?:[A-Za-z0-9_]+\.)?([A-Za-z][A-Za-z0-9_]*)\s*\(/gm, moduleName, file);
    collect(text, /^object\s+([A-Za-z][A-Za-z0-9_]*)/gm, moduleName, file);
    collect(text, /^(?:data\s+)?class\s+([A-Za-z][A-Za-z0-9_]*)/gm, moduleName, file);
    collect(text, /^enum\s+class\s+([A-Za-z][A-Za-z0-9_]*)/gm, moduleName, file);
  }
}

const statusPath = path.join(projectRoot, "src", "miuix", "port-status.ts");
const statusText = readFileSync(statusPath, "utf8");
const coveredNames = new Set();
for (const match of statusText.matchAll(/composeName:\s*"([^"]+)"/g)) {
  const name = match[1].split(".").at(-1);
  if (name) coveredNames.add(name);
}

for (const file of walk(path.join(projectRoot, "src", "miuix"))) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/export\s+(?:const|function|type|class|enum)\s+([A-Za-z][A-Za-z0-9_]*)/g)) {
    coveredNames.add(match[1]);
  }
}

const intentionallyIgnored = new Set([
  "Modifier",
  "RowScope",
  "InteractionSource",
]);

const missing = [...sourceNames.entries()]
  .filter(([name]) => !coveredNames.has(name) && !intentionallyIgnored.has(name))
  .map(([name, sources]) => ({
    name,
    modules: [...new Set(sources.map((source) => source.moduleName))].sort(),
    sample: relative(sources[0].file),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const report = {
  checkedAt: new Date().toISOString(),
  sourceApiCount: sourceNames.size,
  coveredNameCount: coveredNames.size,
  missingCount: missing.length,
  missing,
};

mkdirSync(path.join(projectRoot, "reports"), { recursive: true });
writeFileSync(path.join(projectRoot, "reports", "port-coverage.json"), JSON.stringify(report, null, 2));

console.log(`Source API names: ${report.sourceApiCount}`);
console.log(`Tracked names: ${report.coveredNameCount}`);
console.log(`Missing names: ${report.missingCount}`);
if (missing.length > 0) {
  console.log("First missing names:");
  for (const item of missing.slice(0, 30)) {
    console.log(`- ${item.name} (${item.modules.join(", ")}) ${item.sample}`);
  }
}

function exists(target) {
  try {
    statSync(target);
    return true;
  } catch {
    return false;
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function collect(text, regex, moduleName, file) {
  for (const match of text.matchAll(regex)) {
    const name = match[1];
    if (!sourceNames.has(name)) {
      sourceNames.set(name, []);
    }
    sourceNames.get(name).push({ moduleName, file });
  }
}

function relative(file) {
  return path.relative(sourceRoot, file).replaceAll(path.sep, "/");
}
