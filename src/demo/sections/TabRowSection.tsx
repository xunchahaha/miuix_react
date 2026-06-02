// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { TabRow, TabRowWithContour, Text } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const tabs = ["标签 1", "标签 2", "标签 3"];
const contourTabs = ["标签 1", "标签 2", "标签 3", "标签 4", "标签 5", "标签 6"];

export function TabRowSection() {
  const [selected, setSelected] = useState(0);
  const [contourSelected, setContourSelected] = useState(0);

  return (
    <DemoSection title="标签栏">
      <div className="demo-tabrow-wrapper">
        <TabRow tabs={tabs} selectedTabIndex={selected} onTabSelected={setSelected} />
      </div>
      <DemoCard inset>
        <TabRowWithContour tabs={contourTabs} selectedTabIndex={contourSelected} onTabSelected={setContourSelected} />
        <div className="demo-tabrow-content">
          <Text>{contourTabs[contourSelected]} 的内容</Text>
        </div>
      </DemoCard>
    </DemoSection>
  );
}
