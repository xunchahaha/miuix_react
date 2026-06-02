// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from "react";
import { Card, SmallTitle } from "../miuix";

/**
 * Shared demo layout: a small section title followed by content.
 * Mirrors the `SmallTitle(text = ...)` + content pattern used by every
 * `LazyListScope.xxxSection()` in the original Compose demo.
 */
export function DemoSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="demo-section">
      <SmallTitle>{title}</SmallTitle>
      {children}
    </section>
  );
}

/**
 * A rounded card matching the demo's `Card(modifier = padding(horizontal = 12).padding(bottom = 12))`.
 * `inset` adds the inner 16dp padding used by some cards (insideMargin).
 */
export function DemoCard({ children, inset = false }: { children: ReactNode; inset?: boolean }) {
  // Pass insideMargin through to Card so it sets the inline padding. Card always
  // writes `padding: <insideMargin>` inline, which would otherwise override a
  // `.demo-card--inset { padding: 16px }` CSS rule. Mirrors Kotlin
  // `Card(insideMargin = PaddingValues(16.dp))`.
  return (
    <Card className="demo-card" cornerRadius={16} insideMargin={inset ? 16 : 0}>
      {children}
    </Card>
  );
}
