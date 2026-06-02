// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Card, OverlayDialog, Text, TextButton, useMiuixTheme } from "../../miuix";
import { DemoSection } from "../section";

export function CardSection() {
  const theme = useMiuixTheme();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <DemoSection title="卡片">
      {/* Full-width card. insideMargin must be passed to Card (not just a CSS
          class) because Card always writes `padding: <insideMargin>` inline,
          which would otherwise override a padding rule. Mirrors Kotlin
          Card(insideMargin = PaddingValues(16.dp)). */}
      <Card
        className="demo-card demo-card-stack"
        cornerRadius={16}
        insideMargin={16}
        style={{ background: theme.colors.primaryVariant }}
      >
        <Text className="demo-card-title" style={{ color: theme.colors.onPrimaryVariant, fontSize: 19, fontWeight: 600 }}>卡片</Text>
        <Text style={{ color: theme.colors.onPrimaryVariant, fontSize: 17 }}>ShowIndication: true</Text>
      </Card>

      <div className="demo-card-grid">
        <Card className="demo-card-stack" insideMargin={16} pressFeedbackType="sink" cornerRadius={16} onClick={() => undefined}>
          <Text className="demo-card-title" style={{ fontWeight: 500 }}>卡片</Text>
          <Text variant="paragraph" className="demo-card-summary">按压反馈{"\n"}类型：下沉</Text>
        </Card>
        <Card className="demo-card-stack" insideMargin={16} pressFeedbackType="tilt" cornerRadius={16} onLongPress={() => undefined}>
          <Text className="demo-card-title" style={{ fontWeight: 500 }}>卡片</Text>
          <Text variant="paragraph" className="demo-card-summary">按压反馈{"\n"}类型：倾斜</Text>
        </Card>
      </div>

      <Card className="demo-card demo-card-stack" insideMargin={16} pressFeedbackType="sink" cornerRadius={16} onLongPress={() => setShowDialog(true)}>
        <Text className="demo-card-title" style={{ fontWeight: 500 }}>卡片</Text>
        <Text variant="paragraph" className="demo-card-summary">长按以显示对话框</Text>
      </Card>

      <OverlayDialog
        show={showDialog}
        title="长按操作"
        summary="由长按卡片触发。"
        onDismissRequest={() => setShowDialog(false)}
        actions={
          <div className="demo-dialog-actions">
            <TextButton text="取消" onClick={() => setShowDialog(false)} />
            <TextButton primary text="确认" onClick={() => setShowDialog(false)} />
          </div>
        }
      >
        <span />
      </OverlayDialog>
    </DemoSection>
  );
}
