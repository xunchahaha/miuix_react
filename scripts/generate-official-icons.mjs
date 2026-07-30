// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0
//
// Regenerates src/miuix/official-icons.tsx from the original Kotlin icon
// sources (miuix-icons module), guaranteeing the glyphs stay 1:1 with the
// upstream ImageVector path data.
//
// Usage: node scripts/generate-official-icons.mjs [path-to-miuix-repo]

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const miuixRoot = process.argv[2] ?? join(dirname(repoRoot), "miuix");
const iconsDir = join(
  miuixRoot,
  "miuix-icons/src/commonMain/kotlin/top/yukonga/miuix/kmp/icon/extended",
);
const outFile = join(repoRoot, "src/miuix/official-icons.tsx");

const WEIGHTS = ["Light", "Normal", "Regular", "Medium", "Demibold"];
const CMD = {
  MoveTo: "M",
  LineTo: "L",
  HorizontalTo: "H",
  VerticalTo: "V",
  QuadTo: "Q",
  CurveTo: "C",
  Close: "Z",
};

const files = readdirSync(iconsDir).filter((f) => f.endsWith(".kt")).sort();
const icons = {}; // weight -> name -> IconData
for (const w of WEIGHTS) icons[w] = {};
const names = [];

for (const file of files) {
  const name = file.replace(/\.kt$/, "");
  names.push(name);
  const text = readFileSync(join(iconsDir, file), "utf8");

  // Split into per-weight getter blocks.
  const blockRe = /val MiuixIcons\.(Light|Normal|Regular|Medium|Demibold)\.(\w+): ImageVector/g;
  const blocks = [];
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    blocks.push({ weight: m[1], name: m[2], start: m.index });
  }
  blocks.forEach((block, i) => {
    block.body = text.slice(block.start, blocks[i + 1]?.start ?? text.length);
  });

  for (const block of blocks) {
    if (block.name !== name) {
      throw new Error(`${file}: getter name ${block.name} != file name ${name}`);
    }
    const vw = block.body.match(/viewportWidth = ([\d.]+)f/);
    const vh = block.body.match(/viewportHeight = ([\d.]+)f/);
    if (!vw || !vh) throw new Error(`${file} (${block.weight}): missing viewport`);
    const flip = /group\(scaleY = -1(\.0)?f/.test(block.body);

    // Each addPath(pathData = listOf(...)) becomes one SVG path d string.
    const paths = [];
    const pathDataRe = /pathData = listOf\(([\s\S]*?)\n\s*\),/g;
    let p;
    while ((p = pathDataRe.exec(block.body)) !== null) {
      const nodes = [];
      const nodeRe = /PathNode\.(\w+)(?:\(([^)]*)\))?/g;
      let n;
      while ((n = nodeRe.exec(p[1])) !== null) {
        const cmd = CMD[n[1]];
        if (!cmd) throw new Error(`${file}: unsupported PathNode.${n[1]}`);
        const args = (n[2] ?? "")
          .split(",")
          .map((a) => a.trim().replace(/f$/, "").replace(/\.0$/, ""))
          .filter(Boolean);
        nodes.push(args.length ? `${cmd} ${args.join(" ")}` : cmd);
      }
      if (nodes.length) paths.push(nodes.join(" "));
    }
    if (paths.length === 0) throw new Error(`${file} (${block.weight}): no paths parsed`);

    const data = { viewBox: `0 0 ${vw[1]} ${vh[1]}`, height: vh[1], paths };
    if (!flip) data.flip = false;
    icons[block.weight][name] = data;
  }
}

for (const w of WEIGHTS) {
  const missing = names.filter((n) => !icons[w][n]);
  if (missing.length) throw new Error(`weight ${w} missing: ${missing.join(", ")}`);
}

const header = `// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0
//
// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/generate-official-icons.mjs
// Source of truth: miuix/miuix-icons (Kotlin ImageVector path data).

import type { SVGProps } from "react";

export type MiuixIconWeight = "Light" | "Normal" | "Regular" | "Medium" | "Demibold";

type IconData = {
  viewBox: string;
  height: string;
  paths: string[];
  // Most glyphs are authored bottom-up (font-style) and rendered through a
  // vertical flip; icons already in top-down coordinates set flip: false.
  flip?: boolean;
};

export const OFFICIAL_ICON_NAMES = ${JSON.stringify(names)} as const;

export type OfficialIconName = (typeof OFFICIAL_ICON_NAMES)[number];

export const OFFICIAL_ICONS: Record<MiuixIconWeight, Record<OfficialIconName, IconData>> = ${JSON.stringify(icons)};

export function OfficialIcon({
  name,
  weight = "Regular",
  size = 24,
  className,
  ...props
}: {
  name: OfficialIconName;
  weight?: MiuixIconWeight;
  size?: number;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "name">) {
  const icon = OFFICIAL_ICONS[weight][name];
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="currentColor"
      focusable="false"
      {...props}
    >
      <g transform={icon.flip === false ? undefined : \`translate(0 \${icon.height}) scale(1 -1)\`}>
        {icon.paths.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
    </svg>
  );
}
`;

writeFileSync(outFile, header);
console.log(`Wrote ${names.length} icons x ${WEIGHTS.length} weights to ${outFile}`);
