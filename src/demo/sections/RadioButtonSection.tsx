// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { RadioButtonPreference } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function RadioButtonSection() {
  const [selected, setSelected] = useState(0);

  return (
    <DemoSection title="单选按钮">
      <DemoCard>
        <RadioButtonPreference title="选项 A" summary={`已选中：${selected === 0}`} selected={selected === 0} onClick={() => setSelected(0)} />
        <RadioButtonPreference title="选项 B" summary={`已选中：${selected === 1}`} selected={selected === 1} onClick={() => setSelected(1)} />
        <RadioButtonPreference title="选项 C" summary={`已选中：${selected === 2}`} selected={selected === 2} onClick={() => setSelected(2)} />
        <RadioButtonPreference title="禁用单选按钮" selected enabled={false} onClick={() => undefined} />
      </DemoCard>
    </DemoSection>
  );
}
