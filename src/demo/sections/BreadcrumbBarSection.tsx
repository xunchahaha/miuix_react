// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from "react";
import { BreadcrumbBar, joinToPath, Text, type BreadcrumbItem } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function BreadcrumbBarSection() {
  const items = useMemo<BreadcrumbItem[]>(
    () => [
      { path: "/storage/emulated/0", text: "内部存储" },
      { path: "DataBackup" },
      { path: "apps" },
      { path: "com.tencent.mobileqq" },
      { path: "user_0" },
    ],
    [],
  );
  const [highlightIndex, setHighlightIndex] = useState(items.length - 1);

  return (
    <DemoSection title="面包屑">
      <BreadcrumbBar
        className="demo-breadcrumb-bare"
        items={items}
        onItemClick={setHighlightIndex}
        highlightIndex={highlightIndex}
      />
      <DemoCard inset>
        <div className="demo-breadcrumb-stack">
          <BreadcrumbBar items={items} onItemClick={setHighlightIndex} highlightIndex={highlightIndex} />
          <Text variant="body2" className="demo-card-summary">完整路径：{joinToPath(items)}</Text>
          <Text variant="body2" className="demo-card-summary">当前：{joinToPath(items.slice(0, highlightIndex + 1))}</Text>
          <BreadcrumbBar items={items} onItemClick={() => undefined} enabled={false} />
        </div>
      </DemoCard>
    </DemoSection>
  );
}
