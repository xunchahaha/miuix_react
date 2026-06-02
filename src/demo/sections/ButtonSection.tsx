// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { TextButton } from "../../miuix";
import { DemoSection } from "../section";

export function ButtonSection() {
  const [cancelText, setCancelText] = useState("取消");
  const [submitText, setSubmitText] = useState("提交");
  const [cancelCount, setCancelCount] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);

  return (
    <DemoSection title="按钮">
      <div className="demo-button-row">
        <TextButton
          text={cancelText}
          onClick={() => {
            const next = cancelCount + 1;
            setCancelCount(next);
            setCancelText(`点击：${next}`);
          }}
        />
        <TextButton
          primary
          text={submitText}
          onClick={() => {
            const next = submitCount + 1;
            setSubmitCount(next);
            setSubmitText(`点击：${next}`);
          }}
        />
      </div>
      <div className="demo-button-row">
        <TextButton text="禁用" enabled={false} onClick={() => undefined} />
        <TextButton primary text="禁用" enabled={false} onClick={() => undefined} />
      </div>
    </DemoSection>
  );
}
