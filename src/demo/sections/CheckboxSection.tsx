// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Checkbox, CheckboxPreference, Text, type ToggleableState } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function CheckboxSection() {
  const [checkbox, setCheckbox] = useState(false);
  const [checkboxTrue, setCheckboxTrue] = useState(true);
  const [tristate, setTristate] = useState<ToggleableState>("indeterminate");
  const [endChecked, setEndChecked] = useState(false);
  const [demoChecked, setDemoChecked] = useState(false);

  const cycle = () =>
    setTristate((current) => (current === "off" ? "indeterminate" : current === "indeterminate" ? "on" : "off"));

  return (
    <DemoSection title="复选框">
      <DemoCard>
        <div className="demo-control-row">
          <Checkbox state={checkbox ? "on" : "off"} onClick={() => setCheckbox(!checkbox)} />
          <Checkbox state={checkboxTrue ? "on" : "off"} onClick={() => setCheckboxTrue(!checkboxTrue)} />
          <Checkbox state={tristate} onClick={cycle} />
          <Checkbox state="off" enabled={false} />
          <Checkbox state="on" enabled={false} />
          <Checkbox state="indeterminate" enabled={false} />
        </div>
        <CheckboxPreference
          title="复选框"
          checkboxLocation="end"
          checked={endChecked}
          onCheckedChange={setEndChecked}
          endActions={<Text variant="body2" className="demo-end-text">{String(endChecked)}</Text>}
        />
        <CheckboxPreference
          title="复选框"
          summary={`状态：${demoChecked}`}
          checked={demoChecked}
          onCheckedChange={setDemoChecked}
        />
        <CheckboxPreference title="禁用复选框" checked enabled={false} onCheckedChange={() => undefined} />
      </DemoCard>
    </DemoSection>
  );
}
