// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicComponent, Text } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function BasicSection() {
  const endActions = (disabled: boolean) => (
    <span className="demo-end-actions">
      <Text variant="body2" className={disabled ? "demo-end-text--disabled" : "demo-end-text"}>End1</Text>
      <Text variant="body2" className={disabled ? "demo-end-text--disabled" : "demo-end-text"}>End2</Text>
    </span>
  );

  return (
    <DemoSection title="基础组件">
      <DemoCard>
        <BasicComponent
          title="标题"
          summary="摘要"
          startAction={<Text>起始</Text>}
          endActions={endActions(false)}
        />
        <BasicComponent
          title="标题"
          summary="摘要"
          enabled={false}
          startAction={<Text className="demo-end-text--disabled">起始</Text>}
          endActions={endActions(true)}
        />
      </DemoCard>
    </DemoSection>
  );
}
