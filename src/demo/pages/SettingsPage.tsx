// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { ArrowPreference, DropdownPreference, SwitchPreference, TopAppBar } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const navigationBarDisplayModeOptions = ["图标和文字", "仅图标", "仅文字", "选中项显示文字"];
const floatingNavigationBarStyleOptions = ["默认", "iOS 风格"];
const floatingNavigationBarPositionOptions = ["居中", "靠左", "靠右"];
const floatingToolbarPositionOptions = ["左上", "左中", "左下", "右上", "右中", "右下", "上中", "下中"];
const floatingToolbarOrientationOptions = ["横向", "纵向"];
const fabPositionOptions = ["靠左", "居中", "靠右", "右侧覆盖"];
const colorModeOptions = ["跟随系统", "浅色", "深色", "Monet 跟随系统", "Monet 浅色", "Monet 深色"];
const paletteStyleOptions = ["TonalSpot", "Vibrant", "Expressive", "Content", "Rainbow", "FruitSalad"];
const colorSpecOptions = ["Spec 2021", "Spec 2025"];
const keyColorOptions = ["默认", "蓝色", "紫色", "绿色", "橙色", "红色"];

export function SettingsPage({
  mode,
  onModeChange,
}: {
  mode: "light" | "dark";
  onModeChange: (mode: "light" | "dark") => void;
}) {
  const [showFPSMonitor, setShowFPSMonitor] = useState(false);
  const [enableSquircle, setEnableSquircle] = useState(true);
  const [enableBlur, setEnableBlur] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showNavBar, setShowNavBar] = useState(true);
  const [navigationMode, setNavigationMode] = useState(0);
  const [useFloatingNavigationBar, setUseFloatingNavigationBar] = useState(false);
  const [floatingNavigationBarStyle, setFloatingNavigationBarStyle] = useState(0);
  const [floatingNavigationBarPosition, setFloatingNavigationBarPosition] = useState(0);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState(0);
  const [floatingToolbarOrientation, setFloatingToolbarOrientation] = useState(0);
  const [showFab, setShowFab] = useState(true);
  const [fabPosition, setFabPosition] = useState(2);
  const [enableScrollEndHaptic, setEnableScrollEndHaptic] = useState(false);
  const [enablePageUserScroll, setEnablePageUserScroll] = useState(true);
  const [colorMode, setColorMode] = useState(mode === "dark" ? 2 : 1);
  const [keyColor, setKeyColor] = useState(0);
  const [paletteStyle, setPaletteStyle] = useState(0);
  const [colorSpec, setColorSpec] = useState(1);
  const [enableCornerClip, setEnableCornerClip] = useState(true);
  const [enableDim, setEnableDim] = useState(true);
  const [blockInputDuringTransition, setBlockInputDuringTransition] = useState(true);
  const [popDirectionFollowsSwipeEdge, setPopDirectionFollowsSwipeEdge] = useState(true);

  const handleColorModeChange = (index: number) => {
    setColorMode(index);
    if (index === 2 || index === 5) {
      onModeChange("dark");
    } else {
      onModeChange("light");
    }
  };

  return (
    <div className="demo-page">
      <TopAppBar className="demo-page-topbar" small title="设置" subtitle="v0.0.0 (React)" />

      <DemoSection title="界面">
        <DemoCard>
          <SwitchPreference title="显示 FPS 监视器" checked={showFPSMonitor} onCheckedChange={setShowFPSMonitor} />
          <SwitchPreference title="启用 Squircle 形状" checked={enableSquircle} onCheckedChange={setEnableSquircle} />
          <SwitchPreference title="启用模糊效果" checked={enableBlur} onCheckedChange={setEnableBlur} />
          <SwitchPreference title="显示顶栏" checked={showTopBar} onCheckedChange={setShowTopBar} />
          <SwitchPreference title="显示导航栏" checked={showNavBar} onCheckedChange={setShowNavBar} />
          {showNavBar && (
            <DropdownPreference
              title="导航栏模式"
              items={navigationBarDisplayModeOptions}
              selectedIndex={navigationMode}
              onSelectedIndexChange={setNavigationMode}
            />
          )}
          {showNavBar && (
            <SwitchPreference
              title="使用浮动导航栏"
              checked={useFloatingNavigationBar}
              onCheckedChange={setUseFloatingNavigationBar}
            />
          )}
          {showNavBar && useFloatingNavigationBar && (
            <DropdownPreference
              title="浮动导航栏样式"
              items={floatingNavigationBarStyleOptions}
              selectedIndex={floatingNavigationBarStyle}
              onSelectedIndexChange={setFloatingNavigationBarStyle}
            />
          )}
          {showNavBar && useFloatingNavigationBar && floatingNavigationBarStyle === 0 && (
            <DropdownPreference
              title="浮动导航栏位置"
              items={floatingNavigationBarPositionOptions}
              selectedIndex={floatingNavigationBarPosition}
              onSelectedIndexChange={setFloatingNavigationBarPosition}
            />
          )}
          <SwitchPreference title="显示浮动工具栏" checked={showFloatingToolbar} onCheckedChange={setShowFloatingToolbar} />
          {showFloatingToolbar && (
            <DropdownPreference
              title="浮动工具栏位置"
              items={floatingToolbarPositionOptions}
              selectedIndex={floatingToolbarPosition}
              onSelectedIndexChange={setFloatingToolbarPosition}
            />
          )}
          {showFloatingToolbar && (
            <DropdownPreference
              title="浮动工具栏方向"
              items={floatingToolbarOrientationOptions}
              selectedIndex={floatingToolbarOrientation}
              onSelectedIndexChange={setFloatingToolbarOrientation}
            />
          )}
          <SwitchPreference title="显示浮动操作按钮" checked={showFab} onCheckedChange={setShowFab} />
          {showFab && (
            <DropdownPreference
              title="浮动操作按钮位置"
              items={fabPositionOptions}
              selectedIndex={fabPosition}
              onSelectedIndexChange={setFabPosition}
            />
          )}
          <SwitchPreference title="启用滚动到底触感反馈" checked={enableScrollEndHaptic} onCheckedChange={setEnableScrollEndHaptic} />
          <SwitchPreference title="启用页面用户滚动" checked={enablePageUserScroll} onCheckedChange={setEnablePageUserScroll} />
          <DropdownPreference title="颜色模式" items={colorModeOptions} selectedIndex={colorMode} onSelectedIndexChange={handleColorModeChange} />
          {colorMode >= 3 && (
            <DropdownPreference title="关键色" items={keyColorOptions} selectedIndex={keyColor} onSelectedIndexChange={setKeyColor} />
          )}
          {colorMode >= 3 && keyColor > 0 && (
            <DropdownPreference title="调色板样式" items={paletteStyleOptions} selectedIndex={paletteStyle} onSelectedIndexChange={setPaletteStyle} />
          )}
          {colorMode >= 3 && keyColor > 0 && (
            <DropdownPreference title="颜色规格" items={colorSpecOptions} selectedIndex={colorSpec} onSelectedIndexChange={setColorSpec} />
          )}
        </DemoCard>
      </DemoSection>

      <DemoSection title="Navigation3">
        <DemoCard>
          <SwitchPreference title="启用圆角裁剪" summary="转场期间裁剪顶部场景圆角" checked={enableCornerClip} onCheckedChange={setEnableCornerClip} />
          <SwitchPreference title="启用压暗" summary="转场期间压暗后方场景" checked={enableDim} onCheckedChange={setEnableDim} />
          <SwitchPreference
            title="转场期间阻止输入"
            summary="阻止非目标场景上的触摸输入"
            checked={blockInputDuringTransition}
            onCheckedChange={setBlockInputDuringTransition}
          />
          <SwitchPreference
            title="返回方向跟随滑动边缘"
            summary="返回动画方向跟随手指滑动边缘"
            checked={popDirectionFollowsSwipeEdge}
            onCheckedChange={setPopDirectionFollowsSwipeEdge}
          />
        </DemoCard>
      </DemoSection>

      <DemoSection title="其他">
        <DemoCard>
          <ArrowPreference title="关于" summary="关于这个示例应用" onClick={() => undefined} />
        </DemoCard>
      </DemoSection>
    </div>
  );
}
