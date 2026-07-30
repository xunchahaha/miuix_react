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
            <TextButton text="短 (4s)" onClick={() => snackbar.showSnackbar("此消息将停留 4 秒。")} />
            <TextButton text="长 (10s)" onClick={() => snackbar.showSnackbar("这是一条停留 10 秒的较长消息。", { duration: "long" })} />
          </div>
          <div className="demo-button-row">
            <TextButton text="自定义 (2s)" onClick={() => snackbar.showSnackbar("此消息使用自定义的 2 秒时长。", { duration: 2000 })} />
            <TextButton
              primary
              text={actionText}
              onClick={async () => {
                setActionText("操作：进行中");
                const result = await snackbar.showSnackbar("此消息带有一个操作按钮。", { actionLabel: "撤销" });
                setActionText(result === "actionPerformed" ? "操作：撤销" : "操作：已过期");
              }}
            />
          </div>
          <div className="demo-button-row">
            <TextButton text="可关闭" onClick={() => snackbar.showSnackbar("点按关闭按钮以移除此消息。", { withDismissAction: true, duration: "long" })} />
            <TextButton text="持续显示" onClick={() => snackbar.showSnackbar("此消息将一直显示，直到你手动关闭。", { withDismissAction: true, duration: "indefinite" })} />
          </div>
          <div className="demo-button-row">
            <TextButton
              text="操作 + 关闭"
              onClick={() =>
                snackbar.showSnackbar("此消息同时带有操作和关闭按钮。", {
                  actionLabel: "撤销",
                  withDismissAction: true,
                  duration: "long",
                })
              }
            />
          </div>
        </div>
      </DemoCard>
    </DemoSection>
  );
}
