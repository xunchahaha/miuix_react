// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { TextField } from "../../miuix";
import { DemoSection } from "../section";

export function TextFieldSection() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [text3, setText3] = useState("");
  const [text4, setText4] = useState("");

  return (
    <DemoSection title="文本框">
      <div className="demo-textfield-list">
        <TextField value={text1} onValueChange={setText1} />
        <TextField value={text2} onValueChange={setText2} label="带标题" />
        <TextField value={text3} onValueChange={setText3} label="基于状态" />
        <TextField value={text4} onValueChange={setText4} label="占位符与单行" useLabelAsPlaceholder />
      </div>
    </DemoSection>
  );
}
