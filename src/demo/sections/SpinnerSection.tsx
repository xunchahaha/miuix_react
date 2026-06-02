// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { SpinnerPreference, type DropdownDemoEntry, type DropdownDemoItem } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const spinnerOptions: DropdownDemoItem[] = [
  { text: "选项 1", summary: "红色", color: "#FF5B29" },
  { text: "选项 2", summary: "绿色", color: "#36D167" },
  { text: "选项 3", summary: "蓝色", color: "#3482FF" },
  { text: "选项 4", summary: "黄色", color: "#FFB21D" },
];

// Three groups derived from the four color items (mirrors Compose
// groupedSpinnerOptions: take(2), drop(2), and all relabeled with odd-enabled).
function buildSpinnerGroups(
  g1: number,
  setG1: (i: number) => void,
  g2: number,
  setG2: (i: number) => void,
  g3: number,
  setG3: (i: number) => void,
): DropdownDemoEntry[] {
  return [
    {
      items: spinnerOptions.slice(0, 2).map((item, index) => ({
        ...item,
        selected: g1 === index,
        onClick: () => setG1(index),
      })),
    },
    {
      items: spinnerOptions.slice(2).map((item, index) => ({
        ...item,
        selected: g2 === index,
        onClick: () => setG2(index),
      })),
    },
    {
      items: spinnerOptions.map((item, index) => ({
        ...item,
        text: `选项 ${index + 1}`,
        enabled: index % 2 === 0,
        selected: g3 === index,
        onClick: () => setG3(index),
      })),
    },
  ];
}

export function SpinnerSection() {
  const [overlayIndex, setOverlayIndex] = useState(0);
  const [windowIndex, setWindowIndex] = useState(1);
  const [overlayDialogIndex, setOverlayDialogIndex] = useState(2);
  const [windowDialogIndex, setWindowDialogIndex] = useState(3);

  const [overlayExpanded, setOverlayExpanded] = useState(false);
  const [windowExpanded, setWindowExpanded] = useState(false);
  const [overlayDialogExpanded, setOverlayDialogExpanded] = useState(false);
  const [windowDialogExpanded, setWindowDialogExpanded] = useState(false);
  const [overlayGroupExpanded, setOverlayGroupExpanded] = useState(false);
  const [windowGroupExpanded, setWindowGroupExpanded] = useState(false);
  const [overlayGroupDialogExpanded, setOverlayGroupDialogExpanded] = useState(false);
  const [windowGroupDialogExpanded, setWindowGroupDialogExpanded] = useState(false);

  // Per-group selections for the four grouped rows.
  const [og1, setOg1] = useState(0);
  const [og2, setOg2] = useState(0);
  const [og3, setOg3] = useState(0);
  const [wg1, setWg1] = useState(0);
  const [wg2, setWg2] = useState(0);
  const [wg3, setWg3] = useState(0);
  const [odg1, setOdg1] = useState(0);
  const [odg2, setOdg2] = useState(0);
  const [odg3, setOdg3] = useState(0);
  const [wdg1, setWdg1] = useState(0);
  const [wdg2, setWdg2] = useState(0);
  const [wdg3, setWdg3] = useState(0);

  const dialogSummary = (label: string, expanded: boolean) => `${label}${expanded ? " (已展开)" : " (已折叠)"}`;

  return (
    <DemoSection title="旋转选择器">
      <DemoCard>
        <SpinnerPreference
          title="SpinnerPref (O)"
          summary={overlayExpanded ? "已展开" : "已折叠"}
          items={spinnerOptions}
          selectedIndex={overlayIndex}
          onSelectedIndexChange={setOverlayIndex}
          onExpandedChange={setOverlayExpanded}
        />
        <SpinnerPreference
          title="SpinnerPref (W)"
          summary={windowExpanded ? "已展开" : "已折叠"}
          items={spinnerOptions}
          selectedIndex={windowIndex}
          onSelectedIndexChange={setWindowIndex}
          onExpandedChange={setWindowExpanded}
        />
        <SpinnerPreference
          title="SpinnerPref (O)"
          summary={dialogSummary("对话框模式 (O)", overlayDialogExpanded)}
          dialogButtonString="确定"
          items={spinnerOptions}
          selectedIndex={overlayDialogIndex}
          onSelectedIndexChange={setOverlayDialogIndex}
          onExpandedChange={setOverlayDialogExpanded}
        />
        <SpinnerPreference
          title="SpinnerPref (W)"
          summary={dialogSummary("对话框模式 (W)", windowDialogExpanded)}
          dialogButtonString="确定"
          items={spinnerOptions}
          selectedIndex={windowDialogIndex}
          onSelectedIndexChange={setWindowDialogIndex}
          onExpandedChange={setWindowDialogExpanded}
        />
        <SpinnerPreference
          title="分组 SpinnerPref (O)"
          summary={overlayGroupExpanded ? "已展开" : "已折叠"}
          entries={buildSpinnerGroups(og1, setOg1, og2, setOg2, og3, setOg3)}
          collapseOnSelection={false}
          onExpandedChange={setOverlayGroupExpanded}
        />
        <SpinnerPreference
          title="分组 SpinnerPref (W)"
          summary={windowGroupExpanded ? "已展开" : "已折叠"}
          entries={buildSpinnerGroups(wg1, setWg1, wg2, setWg2, wg3, setWg3)}
          collapseOnSelection={false}
          onExpandedChange={setWindowGroupExpanded}
        />
        <SpinnerPreference
          title="分组 SpinnerPref (O)"
          summary={dialogSummary("对话框模式 (O)", overlayGroupDialogExpanded)}
          dialogButtonString="确定"
          entries={buildSpinnerGroups(odg1, setOdg1, odg2, setOdg2, odg3, setOdg3)}
          onExpandedChange={setOverlayGroupDialogExpanded}
        />
        <SpinnerPreference
          title="分组 SpinnerPref (W)"
          summary={dialogSummary("对话框模式 (W)", windowGroupDialogExpanded)}
          dialogButtonString="确定"
          entries={buildSpinnerGroups(wdg1, setWdg1, wdg2, setWdg2, wdg3, setWdg3)}
          onExpandedChange={setWindowGroupDialogExpanded}
        />
        <SpinnerPreference
          title="禁用 SpinnerPref (O)"
          summary="已折叠"
          items={[{ text: "选项 5" }]}
          selectedIndex={0}
          onSelectedIndexChange={() => undefined}
          enabled={false}
        />
        <SpinnerPreference
          title="禁用 SpinnerPref (W)"
          summary="已折叠"
          items={[{ text: "选项 6" }]}
          selectedIndex={0}
          onSelectedIndexChange={() => undefined}
          enabled={false}
        />
      </DemoCard>
    </DemoSection>
  );
}
