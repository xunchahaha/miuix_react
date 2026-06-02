// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { DropdownPreference, type DropdownDemoEntry } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const shortOptions = ["选项 1", "选项 2", "选项 3", "选项 4"];
const longOptions = [
  "选项 1",
  "较长的选项 2",
  "更长更长的选项 3",
  "很长很长很长的选项 4",
  "非常非常非常长的选项 5",
  "极其极其极其极其长的选项 6",
  "超长超长超长超长的选项 7",
  "超长超长超长超长超长的选项 8",
  "极长极长极长极长极长极长的选项 9",
  "极长极长极长极长极长极长极长的选项 10",
  "巨长巨长巨长巨长巨长巨长巨长的选项 11",
  "巨长巨长巨长巨长巨长巨长巨长巨长的选项 12",
];

export function DropdownSection() {
  const [overlayIndex, setOverlayIndex] = useState(0);
  const [windowIndex, setWindowIndex] = useState(0);
  const [overlayExpanded, setOverlayExpanded] = useState(false);
  const [windowExpanded, setWindowExpanded] = useState(false);

  // Grouped dropdowns: three groups each with their own selection, separated by
  // dividers in the menu (mirrors the Compose `entries` overload).
  const [overlayGroupExpanded, setOverlayGroupExpanded] = useState(false);
  const [windowGroupExpanded, setWindowGroupExpanded] = useState(false);
  const [oGroup1, setOGroup1] = useState(0);
  const [oGroup2, setOGroup2] = useState(0);
  const [oGroup3, setOGroup3] = useState(0);
  const [wGroup1, setWGroup1] = useState(0);
  const [wGroup2, setWGroup2] = useState(0);
  const [wGroup3, setWGroup3] = useState(0);

  const buildGroups = (
    g1: number,
    setG1: (i: number) => void,
    g2: number,
    setG2: (i: number) => void,
    g3: number,
    setG3: (i: number) => void,
  ): DropdownDemoEntry[] => [
    {
      items: ["选项 A-1", "选项 A-2"].map((text, index) => ({
        text,
        selected: g1 === index,
        onClick: () => setG1(index),
      })),
    },
    {
      items: ["选项 B-1", "选项 B-2", "选项 B-3"].map((text, index) => ({
        text,
        selected: g2 === index,
        onClick: () => setG2(index),
      })),
    },
    {
      items: ["选项 C-1", "选项 C-2", "选项 C-3", "选项 C-4"].map((text, index) => ({
        text,
        enabled: index % 2 === 0,
        selected: g3 === index,
        onClick: () => setG3(index),
      })),
    },
  ];

  return (
    <DemoSection title="下拉框">
      <DemoCard>
        <DropdownPreference
          title="DropdownPref (O)"
          summary={overlayExpanded ? "已展开" : "已折叠"}
          items={shortOptions}
          selectedIndex={overlayIndex}
          onSelectedIndexChange={setOverlayIndex}
          onExpandedChange={setOverlayExpanded}
        />
        <DropdownPreference
          title="DropdownPref (W)"
          summary={windowExpanded ? "已展开" : "已折叠"}
          items={longOptions}
          selectedIndex={windowIndex}
          onSelectedIndexChange={setWindowIndex}
          onExpandedChange={setWindowExpanded}
        />
        <DropdownPreference
          title="分组 DropdownPref (O)"
          summary={overlayGroupExpanded ? "已展开" : "已折叠"}
          entries={buildGroups(oGroup1, setOGroup1, oGroup2, setOGroup2, oGroup3, setOGroup3)}
          collapseOnSelection={false}
          onExpandedChange={setOverlayGroupExpanded}
        />
        <DropdownPreference
          title="分组 DropdownPref (W)"
          summary={windowGroupExpanded ? "已展开" : "已折叠"}
          entries={buildGroups(wGroup1, setWGroup1, wGroup2, setWGroup2, wGroup3, setWGroup3)}
          collapseOnSelection={false}
          onExpandedChange={setWindowGroupExpanded}
        />
        <DropdownPreference title="禁用 DropdownPref (O)" items={["选项 1"]} selectedIndex={0} onSelectedIndexChange={() => undefined} enabled={false} />
        <DropdownPreference title="禁用 DropdownPref (W)" items={["选项 1"]} selectedIndex={0} onSelectedIndexChange={() => undefined} enabled={false} />
      </DemoCard>
    </DemoSection>
  );
}
