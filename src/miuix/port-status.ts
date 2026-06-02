export type PortStatus = "ported" | "facade" | "planned";

export type PortStatusEntry = {
  composeName: string;
  reactName: string;
  module: "theme" | "basic" | "overlay" | "window" | "preference" | "menu" | "popup" | "color" | "utils" | "core" | "icons" | "blur" | "shader" | "squircle" | "navigation3";
  status: PortStatus;
  note: string;
};

export const miuixPortStatus: PortStatusEntry[] = [
  { composeName: "MiuixTheme", reactName: "MiuixTheme", module: "theme", status: "ported", note: "Context provider with light/dark tokens and CSS variables." },
  { composeName: "lightColorScheme", reactName: "lightColorScheme", module: "theme", status: "ported", note: "Token values copied from the Compose defaults." },
  { composeName: "darkColorScheme", reactName: "darkColorScheme", module: "theme", status: "ported", note: "Token values copied from the Compose defaults." },
  { composeName: "defaultTextStyles", reactName: "defaultTextStyles", module: "theme", status: "ported", note: "Mapped to React CSSProperties." },
  { composeName: "Button", reactName: "Button", module: "basic", status: "ported", note: "Miuix shape, color states, disabled state and press feedback in CSS." },
  { composeName: "TextButton", reactName: "TextButton", module: "basic", status: "ported", note: "Convenience wrapper around Button." },
  { composeName: "Card", reactName: "Card", module: "basic", status: "ported", note: "Interactive and static variants with sink/tilt feedback." },
  { composeName: "Surface", reactName: "Surface", module: "basic", status: "ported", note: "Shared rounded surface primitive." },
  { composeName: "Switch", reactName: "Switch", module: "basic", status: "ported", note: "Controlled switch with ARIA switch semantics." },
  { composeName: "Checkbox", reactName: "Checkbox", module: "basic", status: "ported", note: "On/off/indeterminate states with ARIA checkbox semantics." },
  { composeName: "RadioButton", reactName: "RadioButton", module: "basic", status: "ported", note: "Controlled radio primitive." },
  { composeName: "Slider", reactName: "Slider", module: "basic", status: "ported", note: "Controlled horizontal range input with Miuix styling." },
  { composeName: "VerticalSlider", reactName: "VerticalSlider", module: "basic", status: "ported", note: "Vertical range input counterpart." },
  { composeName: "RangeSlider", reactName: "RangeSlider", module: "basic", status: "facade", note: "Two synchronized range inputs; custom pointer physics is still planned." },
  { composeName: "TextField", reactName: "TextField", module: "basic", status: "ported", note: "Floating label, leading/trailing slots and controlled text." },
  { composeName: "InputField", reactName: "InputField", module: "basic", status: "facade", note: "Alias to TextField for SearchBar migrations." },
  { composeName: "SearchBar", reactName: "SearchBar", module: "basic", status: "ported", note: "Composes TextField and search icon." },
  { composeName: "TabRow", reactName: "TabRow", module: "basic", status: "ported", note: "Controlled segmented tab row." },
  { composeName: "TabRowWithContour", reactName: "TabRowWithContour", module: "basic", status: "ported", note: "Contour variant wrapper." },
  { composeName: "TopAppBar", reactName: "TopAppBar", module: "basic", status: "ported", note: "Navigation, title, action and bottom slots." },
  { composeName: "SmallTopAppBar", reactName: "SmallTopAppBar", module: "basic", status: "ported", note: "Thin TopAppBar wrapper." },
  { composeName: "Scaffold", reactName: "Scaffold", module: "basic", status: "ported", note: "Top, content, bottom and floating action slots." },
  { composeName: "NavigationBar", reactName: "NavigationBar", module: "basic", status: "ported", note: "Controlled navigation items." },
  { composeName: "NavigationBarItem", reactName: "NavigationBarItem", module: "basic", status: "facade", note: "Standalone item for source compatibility." },
  { composeName: "FloatingNavigationBar", reactName: "FloatingNavigationBar", module: "basic", status: "ported", note: "Floating variant wrapper." },
  { composeName: "NavigationRail", reactName: "NavigationRail", module: "basic", status: "ported", note: "Rail layout wrapper." },
  { composeName: "FloatingActionButton", reactName: "FloatingActionButton", module: "basic", status: "ported", note: "Icon action button." },
  { composeName: "FloatingToolbar", reactName: "FloatingToolbar", module: "basic", status: "ported", note: "Inline toolbar surface." },
  { composeName: "HorizontalDivider", reactName: "HorizontalDivider", module: "basic", status: "ported", note: "CSS divider." },
  { composeName: "VerticalDivider", reactName: "VerticalDivider", module: "basic", status: "ported", note: "CSS divider." },
  { composeName: "LinearProgressIndicator", reactName: "LinearProgressIndicator", module: "basic", status: "ported", note: "Determinate bar." },
  { composeName: "CircularProgressIndicator", reactName: "CircularProgressIndicator", module: "basic", status: "ported", note: "Spinning circular indicator." },
  { composeName: "InfiniteProgressIndicator", reactName: "InfiniteProgressIndicator", module: "basic", status: "ported", note: "Indeterminate linear animation." },
  { composeName: "NumberPicker", reactName: "NumberPicker", module: "basic", status: "facade", note: "Stepper-style web control." },
  { composeName: "DropdownImpl", reactName: "Dropdown", module: "basic", status: "facade", note: "Native select-backed control." },
  { composeName: "SpinnerItemImpl", reactName: "SpinnerItemImpl", module: "basic", status: "facade", note: "Menu item with selected checkmark." },
  { composeName: "ListPopupColumn", reactName: "ListPopupColumn", module: "basic", status: "facade", note: "Popup content column." },
  { composeName: "ListPopupContent", reactName: "ListPopupContent", module: "basic", status: "facade", note: "Alias to popup content column." },
  { composeName: "OverlayDialog", reactName: "OverlayDialog", module: "overlay", status: "ported", note: "React portal dialog." },
  { composeName: "WindowDialog", reactName: "WindowDialog", module: "window", status: "facade", note: "Electron renderer alias to OverlayDialog." },
  { composeName: "OverlayBottomSheet", reactName: "OverlayBottomSheet", module: "overlay", status: "ported", note: "React portal bottom sheet." },
  { composeName: "WindowBottomSheet", reactName: "WindowBottomSheet", module: "window", status: "facade", note: "Electron renderer alias to OverlayBottomSheet." },
  { composeName: "OverlayListPopup", reactName: "OverlayListPopup", module: "overlay", status: "facade", note: "Anchored popup alias." },
  { composeName: "WindowListPopup", reactName: "WindowListPopup", module: "window", status: "facade", note: "Anchored popup alias." },
  { composeName: "OverlayDropdownMenu", reactName: "OverlayDropdownMenu", module: "menu", status: "facade", note: "Dropdown menu alias." },
  { composeName: "WindowDropdownMenu", reactName: "WindowDropdownMenu", module: "menu", status: "facade", note: "Dropdown menu alias." },
  { composeName: "OverlayDropdownPopup", reactName: "OverlayDropdownPopup", module: "popup", status: "facade", note: "Dropdown popup alias." },
  { composeName: "WindowDropdownPopup", reactName: "WindowDropdownPopup", module: "popup", status: "facade", note: "Dropdown popup alias." },
  { composeName: "ArrowPreference", reactName: "ArrowPreference", module: "preference", status: "ported", note: "BasicComponent with arrow end action." },
  { composeName: "SwitchPreference", reactName: "SwitchPreference", module: "preference", status: "ported", note: "Preference row with Switch." },
  { composeName: "CheckboxPreference", reactName: "CheckboxPreference", module: "preference", status: "ported", note: "Preference row with Checkbox." },
  { composeName: "RadioButtonPreference", reactName: "RadioButtonPreference", module: "preference", status: "ported", note: "Preference row with RadioButton." },
  { composeName: "SliderPreference", reactName: "SliderPreference", module: "preference", status: "ported", note: "Preference row with Slider." },
  { composeName: "RangeSliderPreference", reactName: "RangeSliderPreference", module: "preference", status: "ported", note: "Preference row with RangeSlider." },
  { composeName: "OverlayDropdownPreference", reactName: "OverlayDropdownPreference", module: "preference", status: "facade", note: "DropdownPreference alias." },
  { composeName: "WindowDropdownPreference", reactName: "WindowDropdownPreference", module: "preference", status: "facade", note: "DropdownPreference alias." },
  { composeName: "OverlaySpinnerPreference", reactName: "OverlaySpinnerPreference", module: "preference", status: "facade", note: "DropdownPreference alias." },
  { composeName: "WindowSpinnerPreference", reactName: "WindowSpinnerPreference", module: "preference", status: "facade", note: "DropdownPreference alias." },
  { composeName: "Color.toHsv", reactName: "toHsv", module: "color", status: "ported", note: "Hex/RGB conversion utility." },
  { composeName: "Color.toOkLab", reactName: "toOkLab", module: "color", status: "ported", note: "OKLab conversion utility." },
  { composeName: "Color.toOkLch", reactName: "toOkLch", module: "color", status: "ported", note: "OKLCH conversion utility." },
  { composeName: "Platform", reactName: "Platform", module: "core", status: "facade", note: "Electron/browser platform detection." },
  { composeName: "getCornerRadiusBottom", reactName: "getCornerRadiusBottom", module: "core", status: "facade", note: "Desktop-safe compatibility helper." },
  { composeName: "MiuixIcons", reactName: "MiuixIcons", module: "icons", status: "facade", note: "Lucide-backed icon registry for the React port." },
  { composeName: "BlurDefaults", reactName: "BlurDefaults", module: "blur", status: "facade", note: "Backdrop-filter defaults." },
  { composeName: "BlurColors", reactName: "BlurColors", module: "blur", status: "facade", note: "TypeScript blur color model." },
  { composeName: "BlendColorEntry", reactName: "BlendColorEntry", module: "blur", status: "facade", note: "TypeScript blend color model." },
  { composeName: "DeviceTilt", reactName: "DeviceTilt", module: "blur", status: "facade", note: "Browser tilt data model." },
  { composeName: "Highlight", reactName: "Highlight", module: "blur", status: "facade", note: "Highlight data model." },
  { composeName: "LightPosition", reactName: "LightPosition", module: "blur", status: "facade", note: "Highlight light position model." },
  { composeName: "LightSource", reactName: "LightSource", module: "blur", status: "facade", note: "Highlight light source model." },
  { composeName: "BloomStroke", reactName: "BloomStroke", module: "blur", status: "facade", note: "Highlight bloom stroke model." },
  { composeName: "rememberTiltLight", reactName: "rememberTiltLight", module: "blur", status: "facade", note: "React-safe tilt light helper." },
  { composeName: "rememberLayerBackdrop", reactName: "rememberLayerBackdrop", module: "blur", status: "facade", note: "Backdrop support helper." },
  { composeName: "RuntimeShader", reactName: "RuntimeShader", module: "shader", status: "facade", note: "Runtime shader compatibility handle." },
  { composeName: "RenderEffect", reactName: "RenderEffect", module: "shader", status: "facade", note: "CSS filter compatibility handle." },
  { composeName: "isRuntimeShaderSupported", reactName: "isRuntimeShaderSupported", module: "shader", status: "facade", note: "CSS support check." },
  { composeName: "SquircleDefaults", reactName: "SquircleDefaults", module: "squircle", status: "facade", note: "Squircle shape tokens." },
  { composeName: "isSquircleEnabled", reactName: "isSquircleEnabled", module: "squircle", status: "facade", note: "Browser shape support helper." },
  { composeName: "NavDisplay", reactName: "NavDisplay", module: "navigation3", status: "facade", note: "Navigation 3 display shell for React stacks." },
  { composeName: "NavDisplayTransitionEffects", reactName: "NavDisplayTransitionEffects", module: "navigation3", status: "facade", note: "Transition effects model." },
];

export function portedCount() {
  return miuixPortStatus.filter((entry) => entry.status === "ported").length;
}

export function facadeCount() {
  return miuixPortStatus.filter((entry) => entry.status === "facade").length;
}
