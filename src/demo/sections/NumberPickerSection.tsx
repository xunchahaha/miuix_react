// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { NumberPicker, Text } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const pad2 = (value: number) => value.toString().padStart(2, "0");

export function NumberPickerSection() {
  const [hour, setHour] = useState(16);
  const [minute, setMinute] = useState(30);

  return (
    <DemoSection title="数字选择器">
      <DemoCard>
        <div className="demo-number-picker-row">
          <NumberPicker value={hour} onValueChange={setHour} range={[0, 23]} label={pad2} wrapAround />
          <Text variant="title3" style={{ fontWeight: 700 }}>
            :
          </Text>
          <NumberPicker value={minute} onValueChange={setMinute} range={[0, 59]} label={pad2} wrapAround />
        </div>
      </DemoCard>
    </DemoSection>
  );
}
