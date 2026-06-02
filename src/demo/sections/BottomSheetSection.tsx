// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import {
  ArrowPreference,
  DropdownPreference,
  IconButton,
  OverlayBottomSheet,
  SliderPreference,
  SmallTitle,
  SwitchPreference,
  TextField,
  WindowBottomSheet,
} from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const dropdownOptions = ["选项 1", "选项 2"];

export function BottomSheetSection() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showWindow, setShowWindow] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const [switchChecked, setSwitchChecked] = useState(true);

  return (
    <DemoSection title="底部弹出面板">
      <DemoCard>
        <ArrowPreference title="BottomSheet (O)" summary="点击显示一个 OverlayBottomSheet" onClick={() => setShowOverlay(true)} />
        <ArrowPreference title="BottomSheet (W)" summary="点击显示一个 WindowBottomSheet" onClick={() => setShowWindow(true)} />
      </DemoCard>

      <SheetContent
        Component={OverlayBottomSheet}
        title="BottomSheet (O)"
        show={showOverlay}
        onDismiss={() => setShowOverlay(false)}
        dropdownIndex={dropdownIndex}
        onDropdownChange={setDropdownIndex}
        switchChecked={switchChecked}
        onSwitchChange={setSwitchChecked}
      />
      <SheetContent
        Component={WindowBottomSheet}
        title="BottomSheet (W)"
        show={showWindow}
        onDismiss={() => setShowWindow(false)}
        dropdownIndex={dropdownIndex}
        onDropdownChange={setDropdownIndex}
        switchChecked={switchChecked}
        onSwitchChange={setSwitchChecked}
      />
    </DemoSection>
  );
}

function SheetContent({
  Component,
  title,
  show,
  onDismiss,
  dropdownIndex,
  onDropdownChange,
  switchChecked,
  onSwitchChange,
}: {
  Component: typeof OverlayBottomSheet;
  title: string;
  show: boolean;
  onDismiss: () => void;
  dropdownIndex: number;
  onDropdownChange: (index: number) => void;
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
}) {
  const [allowDismiss, setAllowDismiss] = useState(true);
  const [nestedScroll, setNestedScroll] = useState(true);
  const [slider, setSlider] = useState(0.5);
  const [text, setText] = useState("");

  return (
    <Component
      show={show}
      title={title}
      onDismissRequest={onDismiss}
      startAction={<IconButton label="取消" icon="close" onClick={onDismiss} />}
      endAction={<IconButton label="确认" icon="check" onClick={onDismiss} />}
    >
      <div className="demo-sheet-body">
        <SmallTitle>行为设置</SmallTitle>
        <DemoCard>
          <SwitchPreference title="允许关闭" summary="拖动或返回以关闭" checked={allowDismiss} onCheckedChange={setAllowDismiss} />
          <SwitchPreference title="启用嵌套滚动" summary="滚动内容 vs 拖动面板" checked={nestedScroll} onCheckedChange={setNestedScroll} />
        </DemoCard>
        <SliderPreference title="滑块" value={slider} onValueChange={setSlider} />
        <TextField label="文本框" value={text} onValueChange={setText} />
        <DemoCard>
          <DropdownPreference
            title="DropdownPref (O)"
            items={dropdownOptions}
            selectedIndex={dropdownIndex}
            onSelectedIndexChange={onDropdownChange}
          />
          <SwitchPreference title="SwitchPref" checked={switchChecked} onCheckedChange={onSwitchChange} />
        </DemoCard>
      </div>
    </Component>
  );
}
