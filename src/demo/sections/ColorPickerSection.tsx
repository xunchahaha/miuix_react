// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { ColorPalette, ColorPicker, Text, TextField, useMiuixTheme } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const colorSpaces = ["HSV", "OKHSV", "OKLAB", "OKLCH"] as const;

function hexToRgba(hex: string): [number, number, number, number] {
  const match = /^#?([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(hex.trim());
  if (!match) return [0, 0, 0, 1];
  const r = parseInt(match[1].slice(0, 2), 16);
  const g = parseInt(match[1].slice(2, 4), 16);
  const b = parseInt(match[1].slice(4, 6), 16);
  const a = match[2] ? parseInt(match[2], 16) / 255 : 1;
  return [r, g, b, Math.round(a * 100) / 100];
}

function ColorPickerCard({ space }: { space: string }) {
  const theme = useMiuixTheme();
  const [color, setColor] = useState(theme.colors.primary);
  const [r, g, b, a] = hexToRgba(color);

  return (
    <DemoCard inset>
      <Text className="demo-color-rgba">RGBA: {r}, {g}, {b}, {a}</Text>
      <ColorPicker
        value={color}
        onValueChange={setColor}
        colorSpace={space as "HSV" | "OKHSV" | "OKLAB" | "OKLCH"}
        showPreview={false}
      />
      <TextField
        label="HEX"
        value={color.replace(/^#/, "")}
        onValueChange={(value) => setColor(`#${value.replace(/[^0-9a-fA-F]/g, "").slice(0, 8)}`)}
      />
    </DemoCard>
  );
}

export function ColorPickerSection() {
  const theme = useMiuixTheme();
  const [palette, setPalette] = useState(theme.colors.primary);
  const [pr, pg, pb, pa] = hexToRgba(palette);

  return (
    <>
      {colorSpaces.map((space) => (
        <DemoSection key={space} title={`颜色选择器 (${space})`}>
          <ColorPickerCard space={space} />
        </DemoSection>
      ))}

      <DemoSection title="调色板">
        <DemoCard inset>
          <Text className="demo-color-rgba">RGBA: {pr}, {pg}, {pb}, {pa}</Text>
          <ColorPalette value={palette} onValueChange={setPalette} showPreview={false} />
          <TextField
            label="HEX"
            value={palette.replace(/^#/, "")}
            onValueChange={(value) => setPalette(`#${value.replace(/[^0-9a-fA-F]/g, "").slice(0, 8)}`)}
          />
        </DemoCard>
      </DemoSection>
    </>
  );
}
