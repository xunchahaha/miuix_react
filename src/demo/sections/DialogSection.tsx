// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { ArrowPreference, OverlayDialog, TextButton, WindowDialog } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function DialogSection() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showWindow, setShowWindow] = useState(false);

  return (
    <DemoSection title="对话框">
      <DemoCard>
        <ArrowPreference title="Dialog (O)" summary="点击显示一个 OverlayDialog" onClick={() => setShowOverlay(true)} />
        <ArrowPreference title="Dialog (W)" summary="点击显示一个 WindowDialog" onClick={() => setShowWindow(true)} />
      </DemoCard>

      <OverlayDialog
        show={showOverlay}
        title="Dialog (O)"
        summary="一个位于 MiuixPopupHost 内部的对话框组件。"
        onDismissRequest={() => setShowOverlay(false)}
        actions={
          <div className="demo-dialog-actions">
            <TextButton text="取消" onClick={() => setShowOverlay(false)} />
            <TextButton primary text="确认" onClick={() => setShowOverlay(false)} />
          </div>
        }
      />

      <WindowDialog
        show={showWindow}
        title="Dialog (W)"
        summary="一个窗口级对话框，无需 MiuixPopupHost。"
        onDismissRequest={() => setShowWindow(false)}
        actions={
          <div className="demo-dialog-actions">
            <TextButton text="取消" onClick={() => setShowWindow(false)} />
            <TextButton primary text="确认" onClick={() => setShowWindow(false)} />
          </div>
        }
      />
    </DemoSection>
  );
}
