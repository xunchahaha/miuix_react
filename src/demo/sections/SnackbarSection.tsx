// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { TextButton, useSnackbar } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function SnackbarSection() {
  const snackbar = useSnackbar();
  const [actionText, setActionText] = useState("操作");

  return (
    <DemoSection title="轻提示">
      <DemoCard inset>
        <div className="demo-snackbar-grid">
          <div className="demo-button-row">
            <TextButton text="关闭最早的" onClick={() => snackbar.dismissOldest()} />
            <TextButton text="关闭最新的" onClick={() => snackbar.dismissNewest()} />
          </div>
          <div className="demo-button-row">
            <TextButton text="短 (4s)" onClick={() => snackbar.showSnackbar("这是一条短消息")} />
            <TextButton text="长 (10s)" onClick={() => snackbar.showSnackbar("这是一条用于展示更多文本内容的长消息", { duration: "long" })} />
          </div>
          <div className="demo-button-row">
            <TextButton text="自定义 (2s)" onClick={() => snackbar.showSnackbar("这条消息将持续 2 秒", { duration: 2000 })} />
            <TextButton
              primary
              text={actionText}
              onClick={async () => {
                setActionText("操作：进行中");
                const result = await snackbar.showSnackbar("这条消息带有操作", { actionLabel: "撤销" });
                setActionText(result === "actionPerformed" ? "操作：撤销" : "操作：已过期");
              }}
            />
          </div>
          <div className="demo-button-row">
            <TextButton text="可关闭" onClick={() => snackbar.showSnackbar("此消息可通过关闭按钮移除", { withDismissAction: true, duration: "long" })} />
            <TextButton text="持续显示" onClick={() => snackbar.showSnackbar("持续显示的消息，请手动关闭", { withDismissAction: true, duration: "indefinite" })} />
          </div>
        </div>
      </DemoCard>
    </DemoSection>
  );
}
