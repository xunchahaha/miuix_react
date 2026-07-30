// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { IconButton, RichTooltipBox, TooltipBox } from "../../miuix";
import { OfficialIcon } from "../../miuix/official-icons";
import { DemoCard, DemoSection } from "../section";

export function TooltipSection() {
  return (
    <DemoSection title="工具提示">
      <DemoCard inset>
        <div className="demo-tooltip-row">
          <TooltipBox text="编辑">
            <IconButton onClick={() => undefined} label="编辑">
              <OfficialIcon className="miuix-icon" name="Edit" size={24} />
            </IconButton>
          </TooltipBox>
          <RichTooltipBox
            title="富文本提示"
            text="富文本提示可以显示标题、说明文字和一个可选操作。移动到提示上使用操作，或点按外部关闭。"
            actionText="知道了"
            onActionClick={() => undefined}
          >
            <IconButton onClick={() => undefined} label="富文本提示">
              <OfficialIcon className="miuix-icon" name="Info" size={24} />
            </IconButton>
          </RichTooltipBox>
        </div>
      </DemoCard>
    </DemoSection>
  );
}
