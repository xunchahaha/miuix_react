// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { Contact } from "lucide-react";
import { useState } from "react";
import { ArrowPreference, Icon, OverlayDialog, SliderPreference, TextButton, TextField } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function ArrowSection() {
  const [volume, setVolume] = useState(0.5);
  const [showDialog, setShowDialog] = useState(false);
  // Kotlin volumeDialogHoldDown: released only when the dialog finishes dismissing.
  const [dialogHold, setDialogHold] = useState(false);

  return (
    <DemoSection title="箭头">
      <DemoCard>
        <ArrowPreference
          title="箭头"
          startAction={<Icon icon={Contact} size={22} />}
          endActions={<span className="demo-end-text">末尾</span>}
          onClick={() => undefined}
        />
        <SliderPreference
          title="音量"
          valueText={`${Math.round(volume * 100)}%`}
          value={volume}
          onValueChange={setVolume}
          onClick={() => {
            setShowDialog(true);
            setDialogHold(true);
          }}
          holdDown={dialogHold}
        />
        <ArrowPreference
          title="禁用箭头"
          enabled={false}
          endActions={<span className="demo-end-text--disabled">末尾</span>}
        />
      </DemoCard>

      <VolumeDialog
        show={showDialog}
        volume={volume}
        onVolumeChange={setVolume}
        onDismiss={() => setShowDialog(false)}
        onDismissFinished={() => setDialogHold(false)}
      />
    </DemoSection>
  );
}

function VolumeDialog({
  show,
  volume,
  onVolumeChange,
  onDismiss,
  onDismissFinished,
}: {
  show: boolean;
  volume: number;
  onVolumeChange: (value: number) => void;
  onDismiss: () => void;
  onDismissFinished?: () => void;
}) {
  const [text, setText] = useState(String(Math.round(volume * 100)));

  return (
    <OverlayDialog
      show={show}
      title="调整音量"
      summary="输入 0-100"
      onDismissRequest={onDismiss}
      onDismissFinished={onDismissFinished}
      actions={
        <div className="demo-dialog-actions">
          <TextButton text="取消" onClick={onDismiss} />
          <TextButton
            primary
            text="确认"
            onClick={() => {
              const num = Number(text);
              const clamped = Number.isNaN(num) ? Math.round(volume * 100) : Math.min(100, Math.max(0, num));
              onVolumeChange(clamped / 100);
              onDismiss();
            }}
          />
        </div>
      }
    >
      <TextField
        value={text}
        onValueChange={(value) => {
          const digits = value.replace(/\D/g, "").slice(0, 3);
          setText(digits);
        }}
      />
    </OverlayDialog>
  );
}
