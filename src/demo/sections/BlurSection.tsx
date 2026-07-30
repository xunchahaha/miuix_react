// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { DropdownPreference, HorizontalDivider, SliderPreference, SwitchPreference, Text } from "../../miuix";
import {
  blurColors,
  blurFilterCss,
  EFFECT_VARIANT_OPTIONS,
  FOREGROUND_BLEND_OPTIONS,
  isRuntimeShaderSupported,
  TEXTURE_BLEND_OPTIONS,
  useBgEffectMesh,
} from "../../miuix/blur";
import blurTestBg from "../../assets/blur_test_bg.jpg";
import { DemoCard, DemoSection } from "../section";

// Inline-SVG glyph mask reproducing contentBlendMode = DstIn (32px, Black, centered):
// the blurred+blended mesh is kept only inside the glyph shapes (white = keep).
// The SVG is sized tightly around two 32px lines and drawn at its natural size,
// centered, so the text stays a constant 32px (Compose fontSize = 32.sp,
// fillMaxWidth + Center) instead of being horizontally stretched to the card.
const FG_TEXT_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='120'%3E%3Cstyle%3Etext%7Bfont-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:32px;font-weight:900;fill:%23fff%7D%3C/style%3E%3Ctext x='50%25' y='50' text-anchor='middle'%3EForeground Blur%3C/text%3E%3Ctext x='50%25' y='92' text-anchor='middle'%3EMiuix Demo%3C/text%3E%3C/svg%3E\")";

/** HighlightConfig.Container.entries displayNames (Disabled, Large, Medium, Small). Default = Small (index 3). */
const HIGHLIGHT_OPTIONS = ["禁用", "大容器", "中容器", "小容器"];

export function BlurSection() {
  if (!isRuntimeShaderSupported()) return null;
  return (
    <>
      <DemoSection title="纹理模糊">
        <TextureBlurDemo />
      </DemoSection>
      <DemoSection title="前景模糊">
        <ForegroundBlurDemo />
      </DemoSection>
    </>
  );
}

function TextureBlurDemo() {
  // Kotlin: blurRadiusX/Y = 100f, noiseCoefficient = 0.0045, brightness 0, contrast 1, saturation 1.
  const [radius, setRadius] = useState(100);
  const [noise, setNoise] = useState(0.0045);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  // Kotlin default blendModeIndex = 5 (彩色厚 / Colored Thick).
  const [blendIndex, setBlendIndex] = useState(5);
  // Kotlin: containerIndex = HighlightConfig.Container.Small.ordinal = 3.
  const [highlightIndex, setHighlightIndex] = useState(3);

  const blend = TEXTURE_BLEND_OPTIONS[blendIndex];
  const colors = blurColors({ blendColors: blend.token, brightness, contrast, saturation });
  const filter = blurFilterCss(radius, colors);
  const noiseAlpha = Math.min(0.25, noise * 2.5);
  // Disabled, Large (thickest), Medium, Small (thin) — matches enum order.
  const hlAlpha = [0, 0.3, 0.2, 0.12][highlightIndex];

  return (
    <DemoCard>
      <div className="demo-blur-stage">
        <img className="demo-blur-bg" src={blurTestBg} alt="" />
        {/* The glass panel holds its OWN blurred copy of the background so the
            blend layers (mix-blend-mode) composite against the blurred pixels —
            children cannot blend with a backdrop-filter result. */}
        <div
          className="demo-blur-overlay"
          style={{
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.1 + hlAlpha}), inset 0 0 0 1px rgba(255,255,255,${0.06 + hlAlpha / 2})`,
          }}
        >
          <img className="demo-blur-overlay__copy" src={blurTestBg} alt="" style={{ filter }} />
          {colors.blendColors.map((b, i) => (
            <span key={i} className="demo-blur-blend" style={{ background: b.color, mixBlendMode: b.blend }} />
          ))}
          {noiseAlpha > 0 && <span className="demo-blur-noise" style={{ opacity: noiseAlpha }} />}
          <Text variant="headline2" className="demo-blur-text">
            Texture Blur | R={Math.trunc(radius)}
          </Text>
          <Text variant="body2" className="demo-blur-subtext">
            {blend.label} | {HIGHLIGHT_OPTIONS[highlightIndex]}
          </Text>
        </div>
      </div>

      <DropdownPreference
        title="混合模式"
        items={TEXTURE_BLEND_OPTIONS.map((o) => o.label)}
        selectedIndex={blendIndex}
        onSelectedIndexChange={setBlendIndex}
      />
      <DropdownPreference
        title="高光"
        items={HIGHLIGHT_OPTIONS}
        selectedIndex={highlightIndex}
        onSelectedIndexChange={setHighlightIndex}
      />
      <HorizontalDivider />
      <SliderPreference title="模糊半径" valueText={`${Math.trunc(radius)}`} value={radius / 200} onValueChange={(v) => setRadius(v * 200)} />
      <SliderPreference title="噪点" valueText={`${Math.trunc(noise * 10000) / 10000}`} value={noise / 0.1} onValueChange={(v) => setNoise(v * 0.1)} />
      <SliderPreference title="亮度" valueText={`${Math.trunc(brightness * 100) / 100}`} value={(brightness + 1) / 2} onValueChange={(v) => setBrightness(v * 2 - 1)} />
      <SliderPreference title="对比度" valueText={`${Math.trunc(contrast * 100) / 100}`} value={contrast / 3} onValueChange={(v) => setContrast(v * 3)} />
      <SliderPreference title="饱和度" valueText={`${Math.trunc(saturation * 100) / 100}`} value={saturation / 3} onValueChange={(v) => setSaturation(v * 3)} />
    </DemoCard>
  );
}

function ForegroundBlurDemo() {
  // Kotlin: blurRadiusX/Y = 200f, noise 0.0045, brightness 0, contrast 1, saturation 1.
  const [radius, setRadius] = useState(200);
  const [noise, setNoise] = useState(0.0045);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  // Kotlin default blendModeIndex = 1 (Logo Blend).
  const [blendIndex, setBlendIndex] = useState(1);
  // Kotlin: isOs3Effect = true -> Effect Variant index 1 (OS3).
  const [variantIndex, setVariantIndex] = useState(1);
  // Kotlin: dynamicBackground = true.
  const [dynamic, setDynamic] = useState(true);

  const variant = variantIndex === 1 ? "OS3" : "OS2";
  const blend = FOREGROUND_BLEND_OPTIONS[blendIndex];
  const colors = blurColors({ blendColors: blend.token, brightness, contrast, saturation });
  const filter = blurFilterCss(radius, colors);
  const noiseAlpha = Math.min(0.25, noise * 2.5);
  // One shared mesh state drives BOTH the sharp stage background and the blurred
  // copy inside the glyph mask, so the two layers stay perfectly in sync.
  const mesh = useBgEffectMesh(variant, dynamic, false);

  return (
    <DemoCard>
      <div className="demo-blur-stage demo-blur-stage--tall">
        <div className="demo-bg-effect" style={{ background: mesh.background, transition: mesh.transition }} />
        {/* DstIn: the blurred+blended mesh is masked to the glyph shapes; the
            sharp animated mesh shows through everywhere else. The mask container
            renders its own blurred mesh copy so the blend layers can composite
            against it (children cannot blend with a backdrop-filter result). */}
        <div
          className="demo-blur-fg-mask"
          style={{
            WebkitMaskImage: FG_TEXT_MASK,
            maskImage: FG_TEXT_MASK,
          }}
        >
          <div
            className="demo-bg-effect"
            style={{ background: mesh.background, transition: mesh.transition, filter }}
          />
          {colors.blendColors.map((b, i) => (
            <span key={i} className="demo-blur-blend" style={{ background: b.color, mixBlendMode: b.blend }} />
          ))}
          {noiseAlpha > 0 && <span className="demo-blur-noise" style={{ opacity: noiseAlpha }} />}
        </div>
      </div>

      <DropdownPreference
        title="效果变体"
        items={EFFECT_VARIANT_OPTIONS}
        selectedIndex={variantIndex}
        onSelectedIndexChange={setVariantIndex}
      />
      <DropdownPreference
        title="混合模式"
        items={FOREGROUND_BLEND_OPTIONS.map((o) => o.label)}
        selectedIndex={blendIndex}
        onSelectedIndexChange={setBlendIndex}
      />
      <SwitchPreference title="动态背景" checked={dynamic} onCheckedChange={setDynamic} />
      <HorizontalDivider />
      <SliderPreference title="模糊半径" valueText={`${Math.trunc(radius)}`} value={radius / 200} onValueChange={(v) => setRadius(v * 200)} />
      <SliderPreference title="噪点" valueText={`${Math.trunc(noise * 10000) / 10000}`} value={noise / 0.1} onValueChange={(v) => setNoise(v * 0.1)} />
      <SliderPreference title="亮度" valueText={`${Math.trunc(brightness * 100) / 100}`} value={(brightness + 1) / 2} onValueChange={(v) => setBrightness(v * 2 - 1)} />
      <SliderPreference title="对比度" valueText={`${Math.trunc(contrast * 100) / 100}`} value={contrast / 3} onValueChange={(v) => setContrast(v * 3)} />
      <SliderPreference title="饱和度" valueText={`${Math.trunc(saturation * 100) / 100}`} value={saturation / 3} onValueChange={(v) => setSaturation(v * 3)} />
    </DemoCard>
  );
}
