// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Switch, SwitchPreference, Text } from "../../miuix";
import { Collapsible } from "../Collapsible";
import { DemoCard, DemoSection } from "../section";

export function SwitchSection() {
  const [sw, setSw] = useState(false);
  const [swTrue, setSwTrue] = useState(true);
  const [expandSwitch, setExpandSwitch] = useState(false);
  const [nestedSwitch, setNestedSwitch] = useState(false);

  return (
    <DemoSection title="开关">
      <DemoCard>
        <div className="demo-control-row">
          <Switch checked={sw} onCheckedChange={setSw} />
          <Switch checked={swTrue} onCheckedChange={setSwTrue} />
          <Switch checked={false} enabled={false} />
          <Switch checked enabled={false} />
        </div>
        <SwitchPreference title="开关" summary="点击展开一个开关" checked={expandSwitch} onCheckedChange={setExpandSwitch} />
        <Collapsible open={expandSwitch}>
          <SwitchPreference
            title="开关"
            checked={nestedSwitch}
            onCheckedChange={setNestedSwitch}
            endActions={<Text className="demo-end-text">{String(nestedSwitch)}</Text>}
          />
        </Collapsible>
        <SwitchPreference title="禁用开关" checked enabled={false} onCheckedChange={() => undefined} />
      </DemoCard>
    </DemoSection>
  );
}
