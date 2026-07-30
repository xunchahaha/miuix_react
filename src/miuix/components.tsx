import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Menu,
  Minus,
  MoreHorizontal,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { clamp, cx, mergeStyles, px, type SizeValue } from "./utils";
import { themeVars, useMiuixTheme } from "./theme";
import {
  hexToRgba,
  hsvToRgb01,
  okLabInternalToRgb01,
  okLchInternalToRgb01,
  okhsvToRgb01,
  rgb01ToHex,
  rgb01ToOkhsv,
  rgba01ToCss,
  toHsv,
  type OkLab as OkLabColor,
  type OkLch as OkLchColor,
} from "./color";

type DivProps = HTMLAttributes<HTMLDivElement>;
type ButtonPropsBase = ButtonHTMLAttributes<HTMLButtonElement>;
type SliderInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "max" | "step">;

export type PressFeedbackType = "none" | "sink" | "tilt";
export type ToggleableState = "off" | "on" | "indeterminate";

export type ComponentSlot = ReactNode | (() => ReactNode);

function renderSlot(slot: ComponentSlot | undefined) {
  return typeof slot === "function" ? slot() : slot;
}

function sliderPercent(value: number, min: number, max: number) {
  return ((clamp(value, min, max) - min) / (max - min || 1)) * 100;
}

function sliderCenter(percent: number) {
  // thumbRadius = 14px (half of 28px track height)
  // availableWidth = totalWidth - 2 * thumbRadius
  // centerX = thumbRadius + (percent / 100) * availableWidth
  // In CSS: calc(14px + percent% * (100% - 28px) / 100)
  // Simplified: calc(14px + (100% - 28px) * percent / 100)
  return `calc(14px + (100% - 28px) * ${percent / 100})`;
}

// Compose-equivalent key-point / step resolution.
//
// Kotlin `stepsToTickFractions(steps)`: for steps>0 -> fractions i/(steps+1) for
// i in 0..steps+1 (steps+2 dots incl. both ends). For steps==0 -> none.
function stepTickFractions(steps: number): number[] {
  if (!steps || steps <= 0) return [];
  const n = steps + 1;
  const out: number[] = [];
  for (let i = 0; i <= n; i += 1) out.push(i / n);
  return out;
}

// Kotlin `pointsToFractions`: ((point-min)/(max-min)).coerceIn(0,1)
function pointsToFractions(points: number[], min: number, max: number): number[] {
  const span = max - min || 1;
  return points.map((p) => clamp((p - min) / span, 0, 1));
}

// Fractions of the dots actually drawn (Kotlin `computeKeyPointFractions`).
function keyPointDisplayFractions(
  keyPoints: number[] | undefined,
  steps: number | undefined,
  min: number,
  max: number,
  showKeyPoints: boolean,
): number[] {
  if (keyPoints && keyPoints.length > 0) return pointsToFractions(keyPoints, min, max);
  if (showKeyPoints) return stepTickFractions(steps ?? 0);
  return [];
}

// Native <input step> that reproduces the Compose grid. When steps>0 the grid is
// (max-min)/(steps+1) (Kotlin stepCount = steps+1). Otherwise fall back to the
// caller-provided `step` (continuous for custom key points / plain sliders).
function resolveNativeStep(
  steps: number | undefined,
  min: number,
  max: number,
  fallbackStep: number,
): number {
  if (steps && steps > 0) {
    const grid = (max - min) / (steps + 1);
    return grid > 0 ? grid : fallbackStep;
  }
  return fallbackStep;
}

// Kotlin `resolveValueFromFraction`, expressed on raw values.
// - steps>0: snap to the uniform grid of (steps+1) intervals.
// - else if custom keyPoints: MAGNET snap to nearest key point only when within
//   magnetThreshold (fraction distance); otherwise keep the continuous value.
// - else: return the value unchanged.
function resolveSliderValue(
  raw: number,
  min: number,
  max: number,
  steps: number | undefined,
  keyPoints: number[] | undefined,
  magnetThreshold: number,
): number {
  const span = max - min || 1;
  const v = clamp(raw, min, max);
  if (steps && steps > 0) {
    const stepCount = steps + 1;
    const f = (v - min) / span;
    const idx = clamp(Math.round(f * stepCount), 0, stepCount);
    return min + (span * idx) / stepCount;
  }
  if (keyPoints && keyPoints.length > 0) {
    const f = (v - min) / span;
    const fractions = pointsToFractions(keyPoints, min, max);
    let best = fractions[0];
    let bestDist = Math.abs(best - f);
    for (let i = 1; i < fractions.length; i += 1) {
      const d = Math.abs(fractions[i] - f);
      if (d < bestDist) {
        bestDist = d;
        best = fractions[i];
      }
    }
    if (bestDist < magnetThreshold) return min + span * best;
    return v;
  }
  return v;
}

function selectedOptionLabel<T extends string>(options: Array<{ value: T; label: ReactNode }>, value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function Text({
  as: Element = "span",
  variant = "main",
  className,
  style,
  children,
  ...props
}: {
  as?: ElementType;
  variant?: "main" | "paragraph" | "body1" | "body2" | "button" | "footnote1" | "footnote2" | "headline1" | "headline2" | "subtitle" | "title1" | "title2" | "title3" | "title4";
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Element className={cx("miuix-text", `miuix-text--${variant}`, className)} style={style} {...props}>
      {children}
    </Element>
  );
}

export function SmallTitle({ text, children, className, ...props }: { text?: ReactNode; children?: ReactNode } & DivProps) {
  return (
    <div className={cx("miuix-small-title", className)} {...props}>
      {text ?? children}
    </div>
  );
}

export const MiuixIcons: Record<string, LucideIcon> = {
  arrowRight: ArrowRight,
  back: ChevronLeft,
  check: Check,
  close: X,
  dropdown: ChevronsUpDown,
  forward: ChevronRight,
  menu: Menu,
  minus: Minus,
  more: MoreHorizontal,
  search: Search,
  settings: Settings,
};

export type ButtonColors = {
  color: string;
  disabledColor: string;
  contentColor: string;
  disabledContentColor: string;
};

export type TextButtonColors = {
  color: string;
  disabledColor: string;
  textColor: string;
  disabledTextColor: string;
};

export type CardColors = {
  color: string;
  contentColor: string;
};

export type CheckboxColors = {
  checkedForegroundColor: string;
  uncheckedForegroundColor: string;
  disabledCheckedForegroundColor: string;
  disabledUncheckedForegroundColor: string;
  checkedBackgroundColor: string;
  uncheckedBackgroundColor: string;
  disabledCheckedBackgroundColor: string;
  disabledUncheckedBackgroundColor: string;
};

export type SwitchColors = {
  checkedThumbColor: string;
  uncheckedThumbColor: string;
  disabledCheckedThumbColor: string;
  disabledUncheckedThumbColor: string;
  checkedTrackColor: string;
  uncheckedTrackColor: string;
  disabledCheckedTrackColor: string;
  disabledUncheckedTrackColor: string;
};

export type RadioButtonColors = {
  selectedColor: string;
  unselectedColor: string;
  disabledSelectedColor: string;
  disabledUnselectedColor: string;
};

export type SliderColors = {
  foregroundColor: string;
  disabledForegroundColor: string;
  backgroundColor: string;
  disabledBackgroundColor: string;
  thumbColor: string;
  disabledThumbColor: string;
  keyPointColor: string;
  keyPointForegroundColor: string;
};

export type TextFieldColors = {
  backgroundColor: string;
  labelColor: string;
  borderColor: string;
};

export type DropdownEntry<T extends string = string> = {
  value: T;
  label: ReactNode;
};

export type DropdownItem<T extends string = string> = DropdownEntry<T>;

export type DropdownColors = {
  color: string;
  contentColor: string;
  selectedColor: string;
};

export type SnackbarVisuals = {
  message: ReactNode;
  actionLabel?: ReactNode;
};

export type SnackbarColors = {
  color: string;
  contentColor: string;
  actionColor: string;
};

export type ProgressIndicatorColors = {
  foregroundColor: string;
  backgroundColor: string;
};

export type NumberPickerColors = {
  selectedTextColor: string;
  unselectedTextColor: string;
  disabledSelectedTextColor: string;
  disabledUnselectedTextColor: string;
};

export type ScrollBarColors = {
  thumbColor: string;
  trackColor: string;
};

export type TabRowColors = {
  backgroundColor: string;
  selectedBackgroundColor: string;
  contentColor: string;
  selectedContentColor: string;
};

export type BasicComponentColors = {
  color: string;
  contentColor: string;
  summaryColor: string;
};

export type PopupLayoutPosition = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type ListPopupLayoutInfo = {
  placement: PopupLayoutPosition;
  anchorRect: DOMRect | null;
  popupRect: DOMRect | null;
};

export type NavigationItem = {
  label: ReactNode;
  icon?: LucideIcon | keyof typeof MiuixIcons;
};

export type NavigationBarDisplayMode = "always" | "selected" | "labeled";
export type NavigationRailDisplayMode = NavigationBarDisplayMode;
export type SnackbarResult = "dismissed" | "actionPerformed";

export type TopAppBarState = {
  heightOffset: number;
  contentOffset: number;
  collapsedFraction: number;
};

export type PullToRefreshState = {
  distanceFraction: number;
  isRefreshing: boolean;
};

export type SnackbarHostState = {
  showSnackbar: (message: ReactNode, action?: ReactNode) => void;
};

export const ButtonDefaults = {
  MinWidth: 58,
  MinHeight: 40,
  CornerRadius: 16,
  InsideMargin: { horizontal: 16, vertical: 13 },
};

export const CardDefaults = {
  CornerRadius: 16,
  InsideMargin: 0,
};

export const CheckboxDefaults = {
  Size: 26,
};

export const RadioButtonDefaults = {
  Size: 26,
};

export const SwitchDefaults = {
  Width: 49,
  Height: 28,
};

export const SliderDefaults = {
  MinHeight: 28,
  KeyPointRadius: 3.855,
  DefaultHapticEffect: "edge",
};

export const TextFieldDefaults = {
  CornerRadius: 16,
  InsideMargin: { width: 16, height: 16 },
  BorderWidth: 2,
};

export const DividerDefaults = {
  Thickness: 1,
};

export const FloatingActionButtonDefaults = {
  Size: 56,
  CornerRadius: 18,
};

export const FloatingToolbarDefaults = {
  CornerRadius: 999,
};

export const IconButtonDefaults = {
  Size: 40,
};

export const ListPopupDefaults = {
  CornerRadius: 18,
  Placement: "bottom-end" as PopupLayoutPosition,
};

export const DropdownDefaults = {
  CornerRadius: 14,
};

export const SpinnerDefaults = DropdownDefaults;

export const NavigationBarDefaults = {
  DisplayMode: "labeled" as NavigationBarDisplayMode,
};

export const FloatingNavigationBarDefaults = NavigationBarDefaults;

export const NavigationRailDefaults = {
  DisplayMode: "selected" as NavigationRailDisplayMode,
};

export const ProgressIndicatorDefaults = {
  LinearHeight: 6,
  CircularSize: 28,
};

export const NumberPickerDefaults = {
  ItemHeight: 45,
  VisibleItemCount: 5,
  // Resolved against CSS custom properties at render time.
  colors: (): NumberPickerColors => ({
    selectedTextColor: "var(--miuix-on-surface)",
    unselectedTextColor: "var(--miuix-on-surface-secondary)",
    disabledSelectedTextColor: "var(--miuix-disabled-on-secondary)",
    disabledUnselectedTextColor: "var(--miuix-disabled-on-secondary)",
  }),
};

export const ScrollBarDefaults = {
  Thickness: 4,
};

export const SurfaceDefaults = {
  CornerRadius: 16,
};

export const TabRowDefaults = {
  Height: 42,
  CornerRadius: 12,
  ItemSpacing: 9,
  MinWidth: 76,
  MaxWidth: 98,
};

export const TabRowWithContourDefaults = {
  Height: 45,
  CornerRadius: 8,
  ContourPadding: 5,
  OuterCornerRadius: 13, // CornerRadius + ContourPadding = 8 + 5
  ItemSpacing: 5,
  MinWidth: 62,
  MaxWidth: 84,
};

export const TopAppBarDefaults = {
  Height: 96,
};

export const SnackbarDefaults = {
  Duration: 3600,
};

export const PullToRefreshDefaults = {
  RefreshThreshold: 64,
};

export const SearchBarDefaults = {
  Placeholder: "搜索",
};

export const SmallTitleDefaults = {
  TopPadding: 18,
  BottomPadding: 8,
};

export const BasicComponentDefaults = {
  MinHeight: 58,
};

export const DialogDefaults = {
  CornerRadius: 24,
};

export const BottomSheetDefaults = {
  CornerRadius: 24,
};

export const ArrowPreferenceDefaults = {
  EndActionSize: 18,
};

export function Icon({
  icon,
  size = 20,
  className,
  ...props
}: {
  icon: LucideIcon | keyof typeof MiuixIcons;
  size?: number;
} & HTMLAttributes<SVGElement>) {
  const IconImpl = typeof icon === "string" ? MiuixIcons[icon] : icon;
  return <IconImpl aria-hidden className={cx("miuix-icon", className)} size={size} strokeWidth={2.2} {...props} />;
}

export function Surface({
  className,
  cornerRadius = 16,
  color,
  style,
  children,
  ...props
}: {
  cornerRadius?: SizeValue;
  color?: string;
  children: ReactNode;
} & DivProps) {
  return (
    <div
      className={cx("miuix-surface", className)}
      style={mergeStyles({ borderRadius: px(cornerRadius), background: color }, style)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BasicArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.65 1.469a.714.714 0 0 1 1.01 0L8.721 7.53a.714.714 0 0 1 0 1.01L2.66 14.601a.714.714 0 0 1-1.01-1.01L7.205 8.035 1.65 2.479a.714.714 0 0 1 0-1.01Z"
      />
    </svg>
  );
}

export function BasicArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.397 4.738 4.569 2.567l.438-.439.42.419 2.171 2.172.933.932a.761.761 0 0 0 1.076-1.076l-.932-.933-2.172-2.172-.932-.932a.761.761 0 0 0-.781-.184.76.76 0 0 0-.365.204l-.933.932-2.171 2.172-.933.932a.761.761 0 0 0 1.076 1.077l.933-.933Zm0 6.519 2.172 2.172.438.438.42-.419 2.171-2.171.933-.933a.761.761 0 0 1 1.076 1.077l-.932.932-2.172 2.172-.932.932a.761.761 0 0 1-.781.184.76.76 0 0 1-.365-.203l-.933-.933-2.171-2.172-.933-.932a.761.761 0 1 1 1.076-1.077l.933.933Z"
      />
    </svg>
  );
}

export function Card({
  onClick,
  onLongPress,
  pressFeedbackType = "none",
  cornerRadius = 16,
  insideMargin = 0,
  className,
  style,
  children,
  ...props
}: {
  onClick?: () => void;
  onLongPress?: () => void;
  pressFeedbackType?: PressFeedbackType;
  cornerRadius?: SizeValue;
  insideMargin?: SizeValue;
  children: ReactNode;
} & DivProps) {
  const longPressTimer = useRef<number | null>(null);
  // Press-feedback transform state. Sink => scale; Tilt => rotateX/rotateY + origin.
  const [feedbackTransform, setFeedbackTransform] = useState<string | undefined>(undefined);
  const [feedbackOrigin, setFeedbackOrigin] = useState<string | undefined>(undefined);
  const interactive = Boolean(onClick || onLongPress);

  // Kotlin: SinkFeedback.sinkAmount = 0.94f
  const SINK_AMOUNT = 0.94;
  // Kotlin: TiltFeedback.tiltAmount = 8f (degrees)
  const TILT_AMOUNT = 8;
  // CSS perspective reproducing Kotlin cameraDistance = 12 * density (subtle 3D).
  const TILT_PERSPECTIVE = 1000;

  const applyPress = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pressFeedbackType === "sink") {
      setFeedbackOrigin("center");
      setFeedbackTransform(`scale(${SINK_AMOUNT})`);
      return;
    }
    if (pressFeedbackType === "tilt") {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const leftHalf = offsetX < rect.width / 2;
      const topHalf = offsetY < rect.height / 2;
      // Kotlin transformOrigin: pivotFractionX = leftHalf ? 1 : 0; pivotFractionY = topHalf ? 1 : 0
      const originX = leftHalf ? 100 : 0;
      const originY = topHalf ? 100 : 0;
      // Kotlin rotationX = topHalf ? +8 : -8 ; rotationY = leftHalf ? -8 : +8
      // Compose rotateX/rotateY share CSS's convention exactly -> apply DIRECTLY, no negation.
      const rotX = topHalf ? TILT_AMOUNT : -TILT_AMOUNT;
      const rotY = leftHalf ? -TILT_AMOUNT : TILT_AMOUNT;
      setFeedbackOrigin(`${originX}% ${originY}%`);
      setFeedbackTransform(`perspective(${TILT_PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`);
    }
  };

  const releasePress = () => {
    if (pressFeedbackType === "sink") {
      setFeedbackTransform("scale(1)");
    } else if (pressFeedbackType === "tilt") {
      setFeedbackTransform(`perspective(${TILT_PERSPECTIVE}px) rotateX(0deg) rotateY(0deg)`);
    }
  };

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cx("miuix-card", interactive && "miuix-card--interactive", `miuix-card--${pressFeedbackType}`, className)}
      style={mergeStyles(
        {
          borderRadius: px(cornerRadius),
          padding: px(insideMargin),
          transform: feedbackTransform,
          transformOrigin: feedbackOrigin,
        },
        style,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.();
        }
      }}
      onPointerDown={(event) => {
        // Kotlin Card uses pressable(delay = null): feedback appears immediately on down.
        if (pressFeedbackType !== "none") applyPress(event);
        if (onLongPress) {
          clearLongPress();
          // Compose combinedClickable long-press timeout = 500 ms.
          longPressTimer.current = window.setTimeout(onLongPress, 500);
        }
      }}
      onPointerUp={() => {
        if (pressFeedbackType !== "none") releasePress();
        clearLongPress();
      }}
      onPointerCancel={() => {
        if (pressFeedbackType !== "none") releasePress();
        clearLongPress();
      }}
      onPointerLeave={() => {
        if (pressFeedbackType !== "none") releasePress();
        clearLongPress();
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = "secondary",
  enabled = true,
  cornerRadius = 16,
  minWidth = 58,
  minHeight = 40,
  className,
  style,
  children,
  disabled,
  ...props
}: {
  variant?: "secondary" | "primary" | "text";
  enabled?: boolean;
  cornerRadius?: SizeValue;
  minWidth?: SizeValue;
  minHeight?: SizeValue;
  children?: ReactNode;
} & ButtonPropsBase) {
  return (
    <button
      className={cx("miuix-button", `miuix-button--${variant}`, className)}
      style={mergeStyles({ borderRadius: px(cornerRadius), minWidth: px(minWidth), minHeight: px(minHeight) }, style)}
      disabled={disabled || !enabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextButton({ text, children, primary, ...props }: { text?: ReactNode; primary?: boolean; children?: ReactNode } & Parameters<typeof Button>[0]) {
  return (
    <Button variant={primary ? "primary" : "secondary"} {...props}>
      <Text variant="button">{text ?? children}</Text>
    </Button>
  );
}

export function IconButton({
  icon,
  label,
  size = 40,
  className,
  children,
  ...props
}: {
  icon?: LucideIcon | keyof typeof MiuixIcons;
  label: string;
  size?: number;
  children?: ReactNode;
} & ButtonPropsBase) {
  return (
    <button className={cx("miuix-icon-button", className)} style={{ width: size, height: size }} aria-label={label} title={label} {...props}>
      {icon ? <Icon icon={icon} /> : children}
    </button>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  enabled = true,
  className,
  ...props
}: {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  enabled?: boolean;
} & Omit<ButtonPropsBase, "onClick">) {
  const [settling, setSettling] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return undefined;
    }
    setSettling(true);
    const id = window.setTimeout(() => setSettling(false), 360);
    return () => window.clearTimeout(id);
  }, [checked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cx("miuix-switch", checked && "miuix-switch--checked", settling && "miuix-switch--settling", className)}
      disabled={!enabled || !onCheckedChange}
      onClick={(event) => {
        // Stop the click from also reaching a clickable preference row, which
        // would double-toggle (row + switch both call onCheckedChange).
        event.stopPropagation();
        onCheckedChange?.(!checked);
      }}
      {...props}
    >
      <span className="miuix-switch__thumb" />
    </button>
  );
}

export function Checkbox({
  state,
  checked,
  indeterminate = false,
  onClick,
  enabled = true,
  className,
  ...props
}: {
  state?: ToggleableState;
  checked?: boolean;
  indeterminate?: boolean;
  onClick?: () => void;
  enabled?: boolean;
} & ButtonPropsBase) {
  const resolvedState: ToggleableState = state ?? (indeterminate ? "indeterminate" : checked ? "on" : "off");
  // Geometry ported 1:1 from Kotlin Checkbox.kt: viewport 23 mapped into a 26px box
  // (point -> 13 + (point - 11.5) / 23 * 26). strokeWidth = 26 * 0.09 = 2.34, round cap/join.
  // The visible stroke is the [0.186 .. 0.803] arc-length window of the checkmark, so we bake
  // that trim straight into the path d (it crosses the corner: start' -> middle -> end').
  //   check d:  M 8.5759 13.6602 L 11.6435 16.8435 L 17.4999 9.2918
  //   dash d (Indeterminate cross-center gravitation == 1, same window): M 8.3645 13 L 17.362 13
  // Each path uses pathLength=1 + dasharray "1 1" so dashoffset 1 = hidden, 0 = fully drawn,
  // revealing left-to-right (CSS in index.css). This matches the Kotlin trim/draw + dash morph.
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={resolvedState === "indeterminate" ? "mixed" : resolvedState === "on"}
      className={cx("miuix-checkbox", `miuix-checkbox--${resolvedState}`, className)}
      disabled={!enabled || !onClick}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      {...props}
    >
      <svg
        className="miuix-checkbox__mark"
        viewBox="0 0 26 26"
        width="26"
        height="26"
        fill="none"
        aria-hidden
      >
        <path
          className="miuix-checkbox__check"
          d="M8.5759 13.6602 L11.6435 16.8435 L17.4999 9.2918"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={2.34}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="miuix-checkbox__dash"
          d="M8.3645 13 L17.362 13"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={2.34}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function RadioButton({
  selected,
  onClick,
  enabled = true,
  className,
  ...props
}: {
  selected: boolean;
  onClick?: () => void;
  enabled?: boolean;
} & ButtonPropsBase) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cx("miuix-radio", selected && "miuix-radio--selected", className)}
      disabled={!enabled || !onClick}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      {...props}
    >
      {/* Miuix radio is a checkmark indicator drawn with a path-trim animation,
          mirroring Kotlin RadioButton.kt: viewport 56x56, path M 10.9 29 L 23.1 40.8 L 44 16,
          round cap/join, stroke width 7/56 of the box. pathLength="1" lets the draw/retract
          animation run in normalized [0,1] units like Compose's trimEnd. */}
      <svg
        className="miuix-radio__check"
        viewBox="0 0 56 56"
        width={26}
        height={26}
        fill="none"
        aria-hidden
        focusable="false"
      >
        <path
          className="miuix-radio__check-path"
          d="M 10.9 29 L 23.1 40.8 L 44 16"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  steps,
  keyPoints,
  magnetThreshold = 0.02,
  enabled = true,
  showKeyPoints = false,
  className,
  style,
  ...props
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  steps?: number;
  keyPoints?: number[];
  magnetThreshold?: number;
  enabled?: boolean;
  showKeyPoints?: boolean;
} & SliderInputProps) {
  const percent = sliderPercent(value, min, max);
  const nativeStep = resolveNativeStep(steps, min, max, step);
  const dotFractions = keyPointDisplayFractions(keyPoints, steps, min, max, showKeyPoints);
  const hasTicks = dotFractions.length > 0;
  return (
    <div
      className={cx("miuix-slider", hasTicks && "miuix-slider--ticks", className)}
      style={mergeStyles({
        "--miuix-slider-percent": `${percent}%`,
        "--miuix-slider-center": sliderCenter(percent),
      } as CSSProperties, style)}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <span className="miuix-slider__track">
        <span className="miuix-slider__fill" />
      </span>
      {hasTicks && (
        <span className="miuix-slider__ticks" aria-hidden>
          {dotFractions.map((f, i) => (
            <span
              key={i}
              className={cx(
                "miuix-slider__tick",
                f <= percent / 100 && "miuix-slider__tick--active",
              )}
              style={{ left: sliderCenter(f * 100) } as CSSProperties}
            />
          ))}
        </span>
      )}
      <span className="miuix-slider__thumb" />
      <input
        {...props}
        type="range"
        className="miuix-slider__input"
        value={value}
        min={min}
        max={max}
        step={nativeStep}
        disabled={!enabled}
        aria-orientation="horizontal"
        onChange={(event) =>
          onValueChange(
            resolveSliderValue(Number(event.currentTarget.value), min, max, steps, keyPoints, magnetThreshold),
          )
        }
      />
    </div>
  );
}

export function RangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  steps,
  keyPoints,
  magnetThreshold = 0.02,
  enabled = true,
  showKeyPoints = false,
  className,
  style,
}: {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  steps?: number;
  keyPoints?: number[];
  magnetThreshold?: number;
  enabled?: boolean;
  showKeyPoints?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  // Keep start <= end at all times (Kotlin coerceAtMost / coerceAtLeast). The
  // two thumbs may touch (gap 0) but never cross.
  const lo = Math.min(value[0], value[1]);
  const hi = Math.max(value[0], value[1]);
  const startPercent = sliderPercent(lo, min, max);
  const endPercent = sliderPercent(hi, min, max);

  const dotFractions = keyPointDisplayFractions(keyPoints, steps, min, max, showKeyPoints);
  const hasTicks = dotFractions.length > 0;
  const nativeStep = resolveNativeStep(steps, min, max, step);
  const startFrac = startPercent / 100;
  const endFrac = endPercent / 100;

  // Snap a raw native value, then clamp it so the thumbs cannot cross.
  const snap = (raw: number) => resolveSliderValue(raw, min, max, steps, keyPoints, magnetThreshold);

  return (
    <div
      className={cx("miuix-range-slider", hasTicks && "miuix-range-slider--ticks", className)}
      style={mergeStyles({
        "--miuix-range-start": `${startPercent}%`,
        "--miuix-range-end": `${endPercent}%`,
        "--miuix-range-start-center": sliderCenter(startPercent),
        "--miuix-range-end-center": sliderCenter(endPercent),
        // Midpoint between the two thumbs — the hit-area split so each thumb is
        // owned by its own native input (sliderCenter is affine, so the midpoint
        // of the two centers is the center of the averaged percent).
        "--miuix-range-mid-center": sliderCenter((startPercent + endPercent) / 2),
      } as CSSProperties, style)}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <span className="miuix-range-slider__track">
        <span className="miuix-range-slider__fill" />
      </span>
      {hasTicks && (
        <span className="miuix-range-slider__ticks" aria-hidden>
          {dotFractions.map((f, i) => (
            <span
              key={i}
              className={cx(
                "miuix-range-slider__tick",
                f >= startFrac && f <= endFrac && "miuix-range-slider__tick--active",
              )}
              style={{ left: sliderCenter(f * 100) } as CSSProperties}
            />
          ))}
        </span>
      )}
      <span className="miuix-range-slider__thumb miuix-range-slider__thumb--start" />
      <span className="miuix-range-slider__thumb miuix-range-slider__thumb--end" />
      {/* Start thumb input: occupies the LEFT half of the track up to the end
          thumb, so the right portion is owned by the end input. This keeps both
          thumbs draggable even when they touch, and prevents the stacked-input
          dead-zone bug. clip-path restricts the hit area; pointer-events none on
          the unused side. */}
      <input
        type="range"
        className="miuix-range-slider__input miuix-range-slider__input--start"
        value={lo}
        min={min}
        max={max}
        step={nativeStep}
        disabled={!enabled}
        aria-label="区间起点"
        style={{ zIndex: lo >= hi ? 4 : 3 } as CSSProperties}
        onChange={(event) => {
          const next = Math.min(snap(Number(event.currentTarget.value)), hi);
          onValueChange([next, hi]);
        }}
      />
      <input
        type="range"
        className="miuix-range-slider__input miuix-range-slider__input--end"
        value={hi}
        min={min}
        max={max}
        step={nativeStep}
        disabled={!enabled}
        aria-label="区间终点"
        style={{ zIndex: 3 } as CSSProperties}
        onChange={(event) => {
          const next = Math.max(snap(Number(event.currentTarget.value)), lo);
          onValueChange([lo, next]);
        }}
      />
    </div>
  );
}

export function VerticalSlider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  steps,
  keyPoints,
  magnetThreshold = 0.02,
  enabled = true,
  showKeyPoints = false,
  className,
  style,
  ...props
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  steps?: number;
  keyPoints?: number[];
  magnetThreshold?: number;
  enabled?: boolean;
  showKeyPoints?: boolean;
  className?: string;
} & SliderInputProps) {
  const percent = sliderPercent(value, min, max);
  const nativeStep = resolveNativeStep(steps, min, max, step);
  const dotFractions = keyPointDisplayFractions(keyPoints, steps, min, max, showKeyPoints);
  const hasTicks = dotFractions.length > 0;
  const fillFrac = percent / 100;
  return (
    <div
      className={cx("miuix-slider miuix-slider--vertical", hasTicks && "miuix-slider--ticks", className)}
      style={mergeStyles({
        "--miuix-slider-percent": `${percent}%`,
        "--miuix-slider-center": sliderCenter(percent),
      } as CSSProperties, style)}
    >
      <span className="miuix-slider__track">
        <span className="miuix-slider__fill" />
      </span>
      {hasTicks && (
        <span className="miuix-slider__ticks miuix-slider__ticks--vertical" aria-hidden>
          {dotFractions.map((f, i) => (
            <span
              key={i}
              className={cx(
                "miuix-slider__tick",
                f <= fillFrac && "miuix-slider__tick--active",
              )}
              style={{ bottom: sliderCenter(f * 100) } as CSSProperties}
            />
          ))}
        </span>
      )}
      <span className="miuix-slider__thumb" />
      <input
        {...props}
        type="range"
        className="miuix-slider__input"
        value={value}
        min={min}
        max={max}
        step={nativeStep}
        disabled={!enabled}
        aria-orientation="vertical"
        onChange={(event) =>
          onValueChange(
            resolveSliderValue(Number(event.currentTarget.value), min, max, steps, keyPoints, magnetThreshold),
          )
        }
      />
    </div>
  );
}

export function TextField({
  value,
  onValueChange,
  label,
  useLabelAsPlaceholder = false,
  enabled = true,
  leadingIcon,
  trailingIcon,
  className,
  ...props
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  useLabelAsPlaceholder?: boolean;
  enabled?: boolean;
  leadingIcon?: ComponentSlot;
  trailingIcon?: ComponentSlot;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  // Mirror Kotlin LabelAnimState:
  //   Hidden      -> label empty (no label element)
  //   Placeholder -> useLabelAsPlaceholder && text not empty (no label element, native placeholder)
  //   Floating    -> text not empty (label floats up -8px and shrinks to 10px, input shifts down +8px)
  //   Normal       -> empty (label shown full-size 17px, overlapping the input)
  const hasText = Boolean(value);
  // When useLabelAsPlaceholder, the native `placeholder` shows the label, so the
  // floating-label element must NOT render (else it doubles with the placeholder).
  const showLabel = Boolean(label) && !useLabelAsPlaceholder;
  const floating = Boolean(label) && hasText && !useLabelAsPlaceholder;
  return (
    <label className={cx("miuix-text-field", floating && "miuix-text-field--floating", className)}>
      {leadingIcon && <span className="miuix-text-field__icon">{renderSlot(leadingIcon)}</span>}
      <span className="miuix-text-field__body">
        {showLabel && <span className="miuix-text-field__label">{label}</span>}
        <input
          className="miuix-text-field__input"
          value={value}
          placeholder={useLabelAsPlaceholder && !hasText ? label : undefined}
          disabled={!enabled}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          {...props}
        />
      </span>
      {trailingIcon && <span className="miuix-text-field__icon">{renderSlot(trailingIcon)}</span>}
    </label>
  );
}

export const InputField = TextField;

export function SearchBar({
  value,
  onValueChange,
  placeholder = "搜索",
  expanded = false,
  onExpandedChange,
  outsideEndAction,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  // Kotlin SearchBar outsideEndAction: shown at the end of the input row while
  // expanded (expandHorizontally + slideInHorizontally from its own width).
  outsideEndAction?: ComponentSlot;
  children?: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [clearing, setClearing] = useState(false);
  const valueRef = useRef(value);
  const onValueChangeRef = useRef(onValueChange);
  const prevExpandedRef = useRef(expanded);

  useEffect(() => {
    valueRef.current = value;
    onValueChangeRef.current = onValueChange;
  });

  // Kotlin InputField LaunchedEffect(expanded): on collapse wait 100ms, fade the
  // query text out, clear it, restore opacity, and drop focus.
  useEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    prevExpandedRef.current = expanded;
    if (!wasExpanded || expanded) return undefined;
    rootRef.current?.querySelector("input")?.blur();
    if (!valueRef.current) return undefined;
    const timers = [
      window.setTimeout(() => setClearing(true), 100),
      window.setTimeout(() => {
        onValueChangeRef.current("");
        setClearing(false);
      }, 400),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [expanded]);

  return (
    <div
      ref={rootRef}
      className={cx(
        "miuix-search-bar",
        expanded && "miuix-search-bar--expanded",
        clearing && "miuix-search-bar--clearing",
      )}
    >
      <div className="miuix-search-bar__row">
        <TextField
          className="miuix-search-bar__input-field"
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          leadingIcon={<Icon icon="search" size={18} />}
          onFocus={() => onExpandedChange?.(true)}
        />
        {outsideEndAction != null && (
          <div className="miuix-search-bar__end" aria-hidden={!expanded}>
            <div className="miuix-search-bar__end-inner">{renderSlot(outsideEndAction)}</div>
          </div>
        )}
      </div>
      {children != null && (
        <div className="miuix-search-bar__content" aria-hidden={!expanded}>
          <div className="miuix-search-bar__content-inner">{children}</div>
        </div>
      )}
    </div>
  );
}

type TabRowBaseProps = {
  tabs: ReactNode[];
  // Accept either the existing `selected`/`onSelectedChange` pair or the
  // Compose-style `selectedTabIndex`/`onTabSelected` pair.
  selected?: number;
  selectedTabIndex?: number;
  onSelectedChange?: (index: number) => void;
  onTabSelected?: (index: number) => void;
};

function renderTabRowTrack(
  tabs: ReactNode[],
  current: number,
  select: (index: number) => void,
  spacing: number,
  pillRadius: number,
) {
  const count = Math.max(tabs.length, 1);
  // The track is the content box (no padding), so `100%` here equals the exact
  // area the flex tabs occupy. One slot = (100% - totalGap) / count, where
  // totalGap = spacing * (count - 1). The pill translate of (slot + spacing)
  // per index reproduces Compose `selectedTabIndex * (tabWidthPx + spacingPx)`
  // (TabRow.kt:118 / :243): translateX percentages resolve against the pill's
  // OWN width (one slot), so (100% + spacing) * current == current*(slot+spacing).
  const indicatorStyle: CSSProperties = {
    width: `calc((100% - ${spacing * (count - 1)}px) / ${count})`,
    transform: `translateX(calc((100% + ${spacing}px) * ${current}))`,
    borderRadius: px(pillRadius),
  };
  return (
    <div className="miuix-tab-row__track" style={{ gap: px(spacing) }}>
      <div className="miuix-tab-row__indicator" style={indicatorStyle} aria-hidden />
      {tabs.map((tab, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === current}
          className={cx("miuix-tab-row__item", index === current && "miuix-tab-row__item--selected")}
          onClick={() => select(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function TabRow({ tabs, selected, selectedTabIndex, onSelectedChange, onTabSelected }: TabRowBaseProps) {
  const current = selectedTabIndex ?? selected ?? 0;
  const select = onTabSelected ?? onSelectedChange ?? (() => undefined);
  return (
    <div className="miuix-tab-row" style={{ height: px(TabRowDefaults.Height) }}>
      {renderTabRowTrack(tabs, current, select, TabRowDefaults.ItemSpacing, TabRowDefaults.CornerRadius)}
    </div>
  );
}

export function TabRowWithContour({ tabs, selected, selectedTabIndex, onSelectedChange, onTabSelected }: TabRowBaseProps) {
  const current = selectedTabIndex ?? selected ?? 0;
  const select = onTabSelected ?? onSelectedChange ?? (() => undefined);
  return (
    <div
      className="miuix-tab-row miuix-tab-row--contour"
      style={{
        height: px(TabRowWithContourDefaults.Height),
        padding: px(TabRowWithContourDefaults.ContourPadding),
        borderRadius: px(TabRowWithContourDefaults.OuterCornerRadius),
      }}
    >
      {renderTabRowTrack(tabs, current, select, TabRowWithContourDefaults.ItemSpacing, TabRowWithContourDefaults.CornerRadius)}
    </div>
  );
}

export function TopAppBar({
  title,
  subtitle,
  navigationIcon,
  actions,
  bottomContent,
  className,
  small = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  navigationIcon?: ComponentSlot;
  actions?: ComponentSlot;
  bottomContent?: ComponentSlot;
  className?: string;
  small?: boolean;
}) {
  return (
    <header className={cx("miuix-top-app-bar", small && "miuix-top-app-bar--small", className)}>
      <div className="miuix-top-app-bar__row">
        <div className="miuix-top-app-bar__nav">{renderSlot(navigationIcon)}</div>
        <div className="miuix-top-app-bar__titles">
          <Text variant={small ? "title4" : "title2"}>{title}</Text>
          {subtitle && <Text variant="footnote1">{subtitle}</Text>}
        </div>
        <div className="miuix-top-app-bar__actions">{renderSlot(actions)}</div>
      </div>
      {bottomContent && <div className="miuix-top-app-bar__bottom">{renderSlot(bottomContent)}</div>}
    </header>
  );
}

export const SmallTopAppBar = (props: Omit<Parameters<typeof TopAppBar>[0], "small">) => <TopAppBar small {...props} />;

export function Scaffold({
  topBar,
  bottomBar,
  floatingActionButton,
  children,
}: {
  topBar?: ComponentSlot;
  bottomBar?: ComponentSlot;
  floatingActionButton?: ComponentSlot;
  children: ReactNode;
}) {
  return (
    <div className="miuix-scaffold">
      {topBar && <div className="miuix-scaffold__top">{renderSlot(topBar)}</div>}
      <main className="miuix-scaffold__content">{children}</main>
      {bottomBar && <div className="miuix-scaffold__bottom">{renderSlot(bottomBar)}</div>}
      {floatingActionButton && <div className="miuix-scaffold__fab">{renderSlot(floatingActionButton)}</div>}
    </div>
  );
}

export function NavigationBar({
  items,
  selected,
  onSelectedChange,
  floating = false,
}: {
  items: Array<{ label: ReactNode; icon?: LucideIcon | keyof typeof MiuixIcons }>;
  selected: number;
  onSelectedChange: (index: number) => void;
  floating?: boolean;
}) {
  return (
    <nav className={cx("miuix-navigation-bar", floating && "miuix-navigation-bar--floating")}>
      {items.map((item, index) => (
        <button key={index} type="button" className={cx(index === selected && "miuix-navigation-bar__item--selected")} onClick={() => onSelectedChange(index)}>
          {item.icon && <Icon icon={item.icon} size={20} />}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function NavigationBarItem({
  label,
  icon,
  selected,
  onClick,
}: {
  label: ReactNode;
  icon?: LucideIcon | keyof typeof MiuixIcons;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={cx(selected && "miuix-navigation-bar__item--selected")} onClick={onClick}>
      {icon && <Icon icon={icon} size={20} />}
      <span>{label}</span>
    </button>
  );
}

export const FloatingNavigationBar = (props: Omit<Parameters<typeof NavigationBar>[0], "floating">) => <NavigationBar floating {...props} />;

export const FloatingNavigationBarItem = NavigationBarItem;

export function NavigationRail(props: Parameters<typeof NavigationBar>[0]) {
  return (
    <div className="miuix-navigation-rail">
      <NavigationBar {...props} />
    </div>
  );
}

export const NavigationRailItem = NavigationBarItem;

export function FloatingActionButton({ icon, label, children, ...props }: { icon?: LucideIcon | keyof typeof MiuixIcons; label: string; children?: ReactNode } & ButtonPropsBase) {
  return (
    <button className="miuix-fab" aria-label={label} title={label} {...props}>
      {icon ? <Icon icon={icon} /> : children}
    </button>
  );
}

export function FloatingToolbar({ children }: { children: ReactNode }) {
  return <div className="miuix-floating-toolbar">{children}</div>;
}

export function HorizontalDivider() {
  return <div className="miuix-divider miuix-divider--horizontal" />;
}

export function VerticalDivider() {
  return <div className="miuix-divider miuix-divider--vertical" />;
}

// Mirrors Compose CircularProgressIndicator: 30px box, 4px stroke, butt-cap
// background ring (secondaryContainer) + round-cap foreground arc (primary).
// `progress` null/undefined renders the indeterminate (rotating + breathing)
// variant, matching the Compose `progress: Float?` contract.
const CIRCULAR_CIRCUMFERENCE = 81.6814; // 2 * PI * 13

export function CircularProgressIndicator({ progress }: { progress?: number | null }) {
  const indeterminate = progress == null;

  if (indeterminate) {
    return (
      <span className="miuix-progress miuix-progress--circular miuix-progress--circular-indeterminate">
        <svg className="miuix-progress__svg" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">
          <circle className="miuix-progress__circular-track" cx="15" cy="15" r="13" fill="none" strokeWidth="4" />
          <circle className="miuix-progress__circular-arc" cx="15" cy="15" r="13" fill="none" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  // Determinate: startAngle -90deg (top), sweep = 0.1 + (360 - 0.1) * progress.
  const value = clamp(progress, 0, 1);
  const sweepDeg = 0.1 + (360 - 0.1) * value;
  const dash = (CIRCULAR_CIRCUMFERENCE * sweepDeg) / 360;

  return (
    <span className="miuix-progress miuix-progress--circular">
      <svg className="miuix-progress__svg" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">
        <circle className="miuix-progress__circular-track" cx="15" cy="15" r="13" fill="none" strokeWidth="4" />
        <circle
          className="miuix-progress__circular-arc"
          cx="15"
          cy="15"
          r="13"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
          strokeDasharray={`${dash} ${CIRCULAR_CIRCUMFERENCE}`}
        />
      </svg>
    </span>
  );
}

// Mirrors Compose LinearProgressIndicator: 6px tall pill, secondaryContainer
// track, primary fill. Determinate width = 6px + (100% - 6px) * progress so a
// rounded 6px pill is always visible (Compose minWidth = cornerRadius * 2).
// `progress` null/undefined renders the single wrapping-pill indeterminate animation.
export function LinearProgressIndicator({ value, progress, className }: { value?: number; progress?: number | null; className?: string }) {
  const resolved = progress !== undefined ? progress : value;
  const indeterminate = resolved == null;

  if (indeterminate) {
    return (
      <span className={cx("miuix-progress miuix-progress--linear miuix-progress--linear-indeterminate", className)}>
        {/* Kotlin draws ONE 45%-wide pill that wraps at the right edge; the
            second span is its wrapped continuation (one period earlier). */}
        <span className="miuix-progress__linear-seg" />
        <span className="miuix-progress__linear-seg miuix-progress__linear-seg--wrap" />
      </span>
    );
  }

  const v = clamp(resolved as number, 0, 1);
  return (
    <span
      className={cx("miuix-progress miuix-progress--linear", className)}
      style={{ "--miuix-progress": `calc(6px + (100% - 6px) * ${v})` } as CSSProperties}
    >
      <span className="miuix-progress__linear-fill" />
    </span>
  );
}

// Mirrors Compose InfiniteProgressIndicator: 20px gray ring (2px round-cap
// stroke) with a 2px-radius dot orbiting at radius 5 (ring r 9 - 2*dot 2),
// rotating 0->360 over 800ms linear. Distinct from CircularProgressIndicator.
export function InfiniteProgressIndicator({ className }: { className?: string }) {
  return (
    <span className={cx("miuix-progress miuix-progress--infinite", className)}>
      <svg className="miuix-progress__svg miuix-progress__infinite-svg" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" />
        {/* Dot orbits inside the ring; the <g> spins 0->360 over 800ms. */}
        <g className="miuix-progress__infinite-orbit">
          <circle cx="15" cy="10" r="2" fill="#888888" />
        </g>
      </svg>
    </span>
  );
}

// Vertical infinite-scroll wheel picker (Compose NumberPicker.kt): a fixed-height
// clipped column with the selected value centered, neighbours fading + scaling
// out, drag + fling (real exponential decay) + snap-to-nearest critically-damped
// spring, optional wrap-around, and a per-item color lerp (onSurface ->
// onSurfaceSecondary) done with CSS color-mix.
export function NumberPicker({
  value,
  onValueChange,
  enabled = true,
  min,
  max,
  range,
  label,
  visibleItemCount = NumberPickerDefaults.VisibleItemCount,
  wrapAround = false,
  itemHeight = NumberPickerDefaults.ItemHeight,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  enabled?: boolean;
  min?: number;
  max?: number;
  // `range` is the Compose-style [min, max] tuple; falls back to min/max props.
  range?: [number, number];
  label?: (value: number) => ReactNode;
  visibleItemCount?: number;
  wrapAround?: boolean;
  itemHeight?: number;
  className?: string;
}) {
  if (visibleItemCount % 2 !== 1 || visibleItemCount < 3) {
    throw new Error(`visibleItemCount must be odd and at least 3, but was ${visibleItemCount}`);
  }

  const lo = range ? range[0] : min ?? 0;
  const hi = range ? range[1] : max ?? 10;
  if (lo > hi) throw new Error("range must not be empty");

  const itemCount = hi - lo + 1;
  const coercedValue = clamp(value, lo, hi);
  const currentIndex = coercedValue - lo;
  const halfVisibleCount = Math.floor(visibleItemCount / 2);
  const totalHeight = itemHeight * visibleItemCount;
  const labelOf = (v: number) => (label ? label(v) : v);

  const colors = NumberPickerDefaults.colors();
  const selectedColor = enabled ? colors.selectedTextColor : colors.disabledSelectedTextColor;
  const unselectedColor = enabled ? colors.unselectedTextColor : colors.disabledUnselectedTextColor;

  const rootRef = useRef<HTMLDivElement>(null);
  // totalOffset is measured in *items* (positive = scrolled toward larger values).
  const [totalOffset, setTotalOffset] = useState(0);

  // Refs for gesture/animation state that must survive across frames without re-render.
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0); // items per second
  const rafRef = useRef<number | null>(null);
  const valueRef = useRef(coercedValue);
  const indexRef = useRef(currentIndex);
  const onChangeRef = useRef(onValueChange);

  // Keep the latest callback / value / index visible to long-lived closures
  // without re-keying effects (matches Kotlin rememberUpdatedState).
  useEffect(() => {
    onChangeRef.current = onValueChange;
    valueRef.current = coercedValue;
    indexRef.current = currentIndex;
  });

  const setOffset = (next: number) => {
    offsetRef.current = next;
    setTotalOffset(next);
  };

  // Sync offset to 0 when value changes externally and no gesture is active.
  useEffect(() => {
    if (!draggingRef.current && rafRef.current == null && offsetRef.current !== 0) {
      const id = requestAnimationFrame(() => setOffset(0));
      return () => cancelAnimationFrame(id);
    }
  }, [coercedValue]);

  const clampOffset = (raw: number) => {
    if (wrapAround) return raw;
    return clamp(raw, -indexRef.current, itemCount - 1 - indexRef.current);
  };

  const commit = (finalOffset: number) => {
    const offsetInt = Math.round(finalOffset);
    let newIndex: number;
    if (wrapAround) {
      newIndex = (((indexRef.current + offsetInt) % itemCount) + itemCount) % itemCount;
    } else {
      newIndex = clamp(indexRef.current + offsetInt, 0, itemCount - 1);
    }
    const newValue = lo + newIndex;
    if (newValue !== valueRef.current) {
      onChangeRef.current(newValue);
    }
    // Offset resets to 0 because currentIndex now reflects newValue.
    setOffset(0);
  };

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Real exponential decay -> round-to-nearest -> critically-damped spring snap.
  const startFling = (initialVelocityItemsPerSec: number) => {
    stopRaf();
    const FRICTION = -8.4; // Compose: -4.2 * frictionMultiplier(=2)
    const V_THRESHOLD = 0.1; // Compose exponentialDecay absVelocityThreshold default
    const OMEGA = 20; // sqrt(stiffness=400), dampingRatio=1 -> critically damped

    let v = initialVelocityItemsPerSec;
    let x = offsetRef.current;
    let mode: "decay" | "spring" = "decay";
    let target = 0;
    let A = 0;
    let B = 0;
    let springStart = 0;

    let prev = performance.now();

    const enterSpring = (now: number, startX: number, startV: number) => {
      mode = "spring";
      target = clampOffset(Math.round(startX));
      A = startX - target;
      B = startV + OMEGA * A;
      springStart = now;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.064); // clamp to ~1 frame to stay stable
      prev = now;

      if (mode === "decay") {
        const decayFactor = Math.exp(FRICTION * dt);
        const dx = (v / FRICTION) * (decayFactor - 1);
        x += dx;
        v *= decayFactor;
        x = clampOffset(x);
        setOffset(x);
        if (Math.abs(v) <= V_THRESHOLD) {
          enterSpring(now, x, v);
        } else {
          rafRef.current = requestAnimationFrame(frame);
          return;
        }
      }

      // spring mode
      const t = (now - springStart) / 1000;
      const e = Math.exp(-OMEGA * t);
      const disp = (A + B * t) * e; // displacement from target
      const vel = (B - OMEGA * (A + B * t)) * e;
      x = target + disp;
      setOffset(x);
      if (Math.abs(disp) < 0.0005 && Math.abs(vel) < 0.0005) {
        rafRef.current = null;
        commit(target);
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    stopRaf();
    draggingRef.current = true;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || !draggingRef.current) return;
    const now = performance.now();
    const dy = e.clientY - lastYRef.current;
    lastYRef.current = e.clientY;
    const dt = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;
    // Kotlin: dragOffset -= delta / itemHeightPx; dy>0 (drag down) lowers the value.
    const deltaItems = dy / itemHeight;
    if (dt > 0) velocityRef.current = -deltaItems / dt; // items per second
    setOffset(clampOffset(offsetRef.current - deltaItems));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || !draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
    startFling(velocityRef.current);
  };

  // --- Render ---
  const centerItemOffset = totalOffset - Math.round(totalOffset);
  const roundedOffset = Math.round(totalOffset);
  const denom = halfVisibleCount + 0.5;

  const rows: ReactNode[] = [];
  for (let i = -halfVisibleCount - 1; i <= halfVisibleCount + 1; i++) {
    const rawItemIndex = currentIndex + i + roundedOffset;
    let itemIndex: number;
    if (wrapAround) {
      itemIndex = (((rawItemIndex % itemCount) + itemCount) % itemCount);
    } else {
      if (rawItemIndex < 0 || rawItemIndex >= itemCount) continue;
      itemIndex = rawItemIndex;
    }

    const distanceFromCenter = i - centerItemOffset;
    const normalizedDistance = clamp(Math.abs(distanceFromCenter) / denom, 0, 1);
    const alpha = (1 - normalizedDistance) * (1 - normalizedDistance * 0.5);
    const scale = 1 - 0.2 * normalizedDistance;
    const yOffset = distanceFromCenter * itemHeight;
    const mixedColor = `color-mix(in srgb, ${selectedColor} ${(1 - normalizedDistance) * 100}%, ${unselectedColor} ${normalizedDistance * 100}%)`;

    rows.push(
      <div
        key={`${i}-${itemIndex}`}
        className="miuix-number-picker__item"
        style={{
          height: `${itemHeight}px`,
          opacity: alpha,
          color: mixedColor,
          transform: `translateY(${yOffset}px) scale(${scale})`,
        }}
      >
        {labelOf(lo + itemIndex)}
      </div>,
    );
  }

  return (
    <div
      ref={rootRef}
      className={cx("miuix-number-picker", !enabled && "miuix-number-picker--disabled", className)}
      style={{ height: `${totalHeight}px` }}
      role="slider"
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-valuenow={coercedValue}
      aria-valuetext={String(labelOf(coercedValue))}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {rows}
    </div>
  );
}

export function Dropdown<T extends string>({
  value,
  options,
  onValueChange,
  enabled = true,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: ReactNode }>;
  onValueChange: (value: T) => void;
  enabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = selectedOptionLabel(options, value);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setOpen(false);
      setIsExiting(false);
    }, 150); // Match exit animation duration
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        handleClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  return (
    <div ref={rootRef} className={cx("miuix-dropdown", open && "miuix-dropdown--open", className)}>
      <button
        type="button"
        className="miuix-dropdown__button"
        disabled={!enabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="miuix-dropdown__label">{selectedLabel}</span>
        <Icon className="miuix-dropdown-arrow" icon="dropdown" size={18} />
      </button>
      {open && (
        <div className={cx("miuix-dropdown-menu", isExiting && "miuix-dropdown-menu--exiting")} role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={cx("miuix-menu-item", option.value === value && "miuix-menu-item--selected")}
              onClick={() => {
                onValueChange(option.value);
                handleClose();
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Icon icon="check" size={20} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const Spinner = Dropdown;

export function DropdownArrowEndAction({ expanded = false }: { expanded?: boolean }) {
  void expanded;
  return <BasicArrowUpDownIcon className="miuix-dropdown-arrow" />;
}

export function SpinnerItemImpl({ selected, children, onClick }: { selected?: boolean; children: ReactNode; onClick?: () => void }) {
  return <MenuItem end={selected ? <Icon icon="check" size={20} /> : undefined} onClick={onClick}>{children}</MenuItem>;
}

export function ListPopup({ open, anchor, children }: { open: boolean; anchor?: ReactNode; children: ReactNode }) {
  return (
    <div className="miuix-popup-anchor">
      {anchor}
      {open && <div className="miuix-list-popup">{children}</div>}
    </div>
  );
}

export function ListPopupColumn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("miuix-list-popup-column", className)}>{children}</div>;
}

export const ListPopupContent = ListPopupColumn;

export function rememberListPopupLayoutInfo() {
  return {
    anchorRect: null,
    popupRect: null,
    placement: "bottom-end" as const,
  };
}

export function DropdownMenu({ open, children }: { open: boolean; children: ReactNode }) {
  return open ? <div className="miuix-dropdown-menu">{children}</div> : null;
}

export const OverlayDropdownMenu = DropdownMenu;
export const WindowDropdownMenu = DropdownMenu;
export const OverlayDropdownPopup = DropdownMenu;
export const WindowDropdownPopup = DropdownMenu;
export const OverlayDropdownDialog = OverlayDialog;
export const WindowDropdownDialog = OverlayDialog;

export function MenuItem({ start, end, children, onClick }: { start?: ComponentSlot; end?: ComponentSlot; children: ReactNode; onClick?: () => void }) {
  return (
    <button className="miuix-menu-item" type="button" onClick={onClick}>
      {start && <span>{renderSlot(start)}</span>}
      <span>{children}</span>
      {end && <span>{renderSlot(end)}</span>}
    </button>
  );
}

// Drives a mount/enter/exit lifecycle so dialogs and sheets animate in and out
// instead of snapping. Returns whether to render and the current phase.
function useOverlayTransition(visible: boolean, exitDuration: number) {
  const [mounted, setMounted] = useState(visible);
  // The phase is derived, not stored, to avoid syncing multiple state vars
  // inside the effect.
  const [entered, setEntered] = useState(visible);

  useEffect(() => {
    if (visible) {
      const raf = requestAnimationFrame(() => {
        setMounted(true);
        setEntered(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    const raf = requestAnimationFrame(() => setEntered(false));
    const id = window.setTimeout(() => setMounted(false), exitDuration);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
    };
  }, [visible, exitDuration]);

  return { mounted, phase: (entered ? "enter" : "exit") as "enter" | "exit" };
}

// Re-applies the active theme's CSS custom properties on the portal root.
// The portal mounts into document.body, which is OUTSIDE the `.miuix-theme`
// wrapper that normally injects `--miuix-*`. Without this, every var() inside
// the dialog/sheet resolves to nothing -> transparent background + invisible UI.
function usePortalThemeStyle(): CSSProperties {
  const theme = useMiuixTheme();
  return useMemo(() => themeVars(theme), [theme]);
}

// Dialog exit easing = Kotlin tween(260, DecelerateEasing(1.5f)) = 1-(1-t)^3.
const DIALOG_EXIT_MS = 260;
// Bottom-sheet exit ~ folmeSpring(0.9, 0.38) settle; overshoot invisible off-screen.
const SHEET_EXIT_MS = 380;

export function OverlayDialog({
  open,
  show,
  onDismiss,
  onDismissRequest,
  onDismissFinished,
  title,
  summary,
  children,
  actions,
}: {
  open?: boolean;
  show?: boolean;
  onDismiss?: () => void;
  onDismissRequest?: () => void;
  onDismissFinished?: () => void;
  title?: ReactNode;
  summary?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const visible = show ?? open ?? false;
  const dismiss = onDismissRequest ?? onDismiss ?? (() => undefined);
  const { mounted, phase } = useOverlayTransition(visible, DIALOG_EXIT_MS);
  const themeStyle = usePortalThemeStyle();

  useEffect(() => {
    if (!mounted && !visible) onDismissFinished?.();
  }, [mounted, visible, onDismissFinished]);

  if (!mounted) return null;
  return createPortal(
    <div
      className={cx("miuix-modal", "miuix-modal--dialog", `miuix-modal--${phase}`)}
      role="presentation"
      style={themeStyle}
      onMouseDown={dismiss}
    >
      <div
        className={cx("miuix-dialog", `miuix-dialog--${phase}`)}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {title != null && (
          <Text as="h2" variant="title4" className="miuix-dialog__title">
            {title}
          </Text>
        )}
        {summary != null && (
          <Text variant="body1" className="miuix-dialog__summary">
            {summary}
          </Text>
        )}
        {children != null && <div className="miuix-dialog__content">{children}</div>}
        {actions && <div className="miuix-dialog__actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

export const WindowDialog = OverlayDialog;

export function OverlayBottomSheet({
  open,
  show,
  onDismiss,
  onDismissRequest,
  onDismissFinished,
  title,
  startAction,
  endAction,
  children,
}: {
  open?: boolean;
  show?: boolean;
  onDismiss?: () => void;
  onDismissRequest?: () => void;
  onDismissFinished?: () => void;
  title?: ReactNode;
  startAction?: ComponentSlot;
  endAction?: ComponentSlot;
  children: ReactNode;
}) {
  const visible = show ?? open ?? false;
  const dismiss = onDismissRequest ?? onDismiss ?? (() => undefined);
  const { mounted, phase } = useOverlayTransition(visible, SHEET_EXIT_MS);
  const themeStyle = usePortalThemeStyle();

  useEffect(() => {
    if (!mounted && !visible) onDismissFinished?.();
  }, [mounted, visible, onDismissFinished]);

  if (!mounted) return null;
  return createPortal(
    <div
      className={cx("miuix-modal", "miuix-modal--sheet", `miuix-modal--${phase}`)}
      role="presentation"
      style={themeStyle}
      onMouseDown={dismiss}
    >
      <div
        className={cx("miuix-bottom-sheet", `miuix-bottom-sheet--${phase}`)}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="miuix-bottom-sheet__handle" />
        {(title != null || startAction || endAction) && (
          <div className="miuix-bottom-sheet__header">
            <span className="miuix-bottom-sheet__header-start">{renderSlot(startAction)}</span>
            {title != null && <Text variant="title4">{title}</Text>}
            <span className="miuix-bottom-sheet__header-end">{renderSlot(endAction)}</span>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export const WindowBottomSheet = OverlayBottomSheet;

export const OverlayListPopup = ListPopup;
export const WindowListPopup = ListPopup;
export const OverlayCascadingListPopup = ListPopup;
export const WindowCascadingListPopup = ListPopup;

export function BasicComponent({
  title,
  summary,
  startAction,
  endAction,
  endActions,
  enabled = true,
  onClick,
  holdDown = false,
  className,
}: {
  title?: ReactNode;
  summary?: ReactNode;
  startAction?: ComponentSlot;
  // `endAction` is the single-slot form; `endActions` mirrors the Compose
  // multi-slot RowScope variant. Both render into the same right region.
  endAction?: ComponentSlot;
  endActions?: ComponentSlot;
  enabled?: boolean;
  onClick?: () => void;
  // Kotlin holdDownState: keeps the pressed-style overlay lit while an owned
  // popup/dialog is open.
  holdDown?: boolean;
  className?: string;
}) {
  const interactive = Boolean(onClick) && enabled;
  const endContent = endActions ?? endAction;
  return (
    <div
      className={cx(
        "miuix-basic-component",
        !enabled && "miuix-basic-component--disabled",
        // Kotlin BasicComponent only applies Modifier.clickable (and with it the
        // hover/press indication) when `enabled && onClick != null`.
        interactive && "miuix-basic-component--interactive",
        holdDown && "miuix-basic-component--held",
        className,
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      {startAction && <span className="miuix-basic-component__start">{renderSlot(startAction)}</span>}
      <span className="miuix-basic-component__body">
        {title != null && <Text variant="headline1" className="miuix-basic-component__title">{title}</Text>}
        {summary != null && <Text variant="body2" className="miuix-basic-component__summary">{summary}</Text>}
      </span>
      {endContent != null && (
        <span className="miuix-basic-component__end">
          {renderSlot(endContent)}
        </span>
      )}
    </div>
  );
}

export function Preference(props: Parameters<typeof BasicComponent>[0]) {
  return <BasicComponent {...props} />;
}

export function ArrowPreference({
  endActions,
  enabled = true,
  ...props
}: {
  endActions?: ComponentSlot;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions">) {
  return (
    <BasicComponent
      {...props}
      enabled={enabled}
      endActions={
        <span className="miuix-arrow-end-group">
          {endActions != null && renderSlot(endActions)}
          <BasicArrowRightIcon className={cx("miuix-arrow-end-icon", !enabled && "miuix-arrow-end-icon--disabled")} />
        </span>
      }
    />
  );
}

export function SwitchPreference({
  checked,
  onCheckedChange,
  enabled = true,
  endActions,
  ...props
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  enabled?: boolean;
  endActions?: ComponentSlot;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick">) {
  return (
    <BasicComponent
      {...props}
      enabled={enabled}
      onClick={() => onCheckedChange(!checked)}
      endActions={
        <span
          className="miuix-checkbox-end-group"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {endActions != null && renderSlot(endActions)}
          <Switch checked={checked} enabled={enabled} onCheckedChange={enabled ? onCheckedChange : undefined} />
        </span>
      }
    />
  );
}

export type CheckboxLocation = "start" | "end";

export function CheckboxPreference({
  checked,
  onCheckedChange,
  checkboxLocation = "start",
  enabled = true,
  endActions,
  ...props
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  checkboxLocation?: CheckboxLocation;
  enabled?: boolean;
  endActions?: ComponentSlot;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick" | "startAction">) {
  const checkbox = <Checkbox checked={checked} enabled={enabled} onClick={enabled ? () => onCheckedChange(!checked) : undefined} />;
  return (
    <BasicComponent
      {...props}
      enabled={enabled}
      onClick={() => onCheckedChange(!checked)}
      startAction={checkboxLocation === "start" ? checkbox : undefined}
      endActions={
        checkboxLocation === "end" ? (
          <span
            className="miuix-checkbox-end-group"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {endActions != null && renderSlot(endActions)}
            {checkbox}
          </span>
        ) : (
          endActions
        )
      }
    />
  );
}

export function RadioButtonPreference({
  selected,
  onSelected,
  onClick,
  enabled = true,
  ...props
}: {
  selected: boolean;
  // Accept either `onSelected` (existing) or `onClick` (Compose demo style).
  onSelected?: () => void;
  onClick?: () => void;
  enabled?: boolean;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "onClick" | "startAction">) {
  const handleSelect = onSelected ?? onClick;
  return (
    <BasicComponent
      {...props}
      enabled={enabled}
      onClick={handleSelect}
      startAction={<RadioButton selected={selected} enabled={enabled} onClick={enabled ? handleSelect : undefined} />}
    />
  );
}

export function SliderPreference({
  value,
  onValueChange,
  valueText,
  min = 0,
  max = 1,
  step = 0.01,
  steps,
  keyPoints,
  magnetThreshold = 0.02,
  enabled = true,
  showKeyPoints = false,
  onClick,
  holdDown = false,
  ...props
}: {
  value: number;
  onValueChange: (value: number) => void;
  valueText?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  steps?: number;
  keyPoints?: number[];
  magnetThreshold?: number;
  enabled?: boolean;
  showKeyPoints?: boolean;
  onClick?: () => void;
  holdDown?: boolean;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick">) {
  const interactive = Boolean(onClick) && enabled;
  return (
    <div
      className={cx(
        "miuix-preference-with-control",
        interactive && "miuix-preference-with-control--interactive",
        holdDown && "miuix-preference-with-control--held",
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <BasicComponent
        {...props}
        enabled={enabled}
        endAction={<Text variant="footnote1" className="miuix-preference-value">{valueText ?? `${Math.round(value * 100)}%`}</Text>}
      />
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        steps={steps}
        keyPoints={keyPoints}
        magnetThreshold={magnetThreshold}
        enabled={enabled}
        showKeyPoints={showKeyPoints}
      />
    </div>
  );
}

export function RangeSliderPreference({
  value,
  onValueChange,
  valueText,
  min = 0,
  max = 1,
  step = 0.01,
  steps,
  keyPoints,
  magnetThreshold = 0.02,
  showKeyPoints = false,
  enabled = true,
  ...props
}: {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  valueText?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  steps?: number;
  keyPoints?: number[];
  magnetThreshold?: number;
  showKeyPoints?: boolean;
  enabled?: boolean;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick">) {
  return (
    <div className="miuix-preference-with-control">
      <BasicComponent
        {...props}
        enabled={enabled}
        endAction={<Text variant="footnote1" className="miuix-preference-value">{valueText ?? `${Math.round(value[0] * 100)}-${Math.round(value[1] * 100)}%`}</Text>}
      />
      <RangeSlider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        steps={steps}
        keyPoints={keyPoints}
        magnetThreshold={magnetThreshold}
        showKeyPoints={showKeyPoints}
        enabled={enabled}
      />
    </div>
  );
}

// Item-list dropdown demo model: each option may carry a summary and an icon
// color swatch (Spinner variant), selected via numeric index — mirrors the
// Compose DropdownItem / selectedIndex API used throughout the demo.
export type DropdownDemoItem = {
  text: ReactNode;
  summary?: ReactNode;
  color?: string;
  enabled?: boolean;
  children?: DropdownDemoEntryItem[];
};

// One item inside a grouped dropdown/spinner. Mirrors Kotlin DropdownItem's
// per-item `selected`/`onClick`, used by the grouped (`entries`) preference form.
export type DropdownDemoEntryItem = DropdownDemoItem & {
  selected?: boolean;
  onClick?: () => void;
};

// A group of items separated from sibling groups by a divider in the menu.
// Mirrors Kotlin DropdownEntry.
export type DropdownDemoEntry = {
  items: DropdownDemoEntryItem[];
};

// Internal flattened row model shared by the popup + dialog renderers.
type NormDropdownItem = {
  text: ReactNode;
  summary?: ReactNode;
  color?: string;
  enabled: boolean;
  selected: boolean;
  onSelect: () => void;
  children?: NormDropdownItem[];
};
type NormDropdownGroup = { items: NormDropdownItem[] };

function normalizeDropdownEntryItem(item: DropdownDemoEntryItem): NormDropdownItem {
  return {
    text: item.text,
    summary: item.summary,
    color: item.color,
    enabled: item.enabled !== false,
    selected: Boolean(item.selected),
    onSelect: () => item.onClick?.(),
    children: item.children?.map(normalizeDropdownEntryItem),
  };
}

function DropdownItemList({
  groups,
  valueText,
  enabled,
  spinner,
  collapseOnSelection,
  dialog,
  onExpandedChange,
  iconTrigger,
  registerToggle,
}: {
  groups: NormDropdownGroup[];
  valueText: ReactNode;
  enabled: boolean;
  spinner: boolean;
  collapseOnSelection: boolean;
  // When set, the options render as a centered dialog with a confirm button
  // (Compose "As Dialog" spinner) instead of an anchored popup.
  dialog?: { title: ReactNode; buttonString: string };
  onExpandedChange?: (expanded: boolean) => void;
  iconTrigger?: { label: string; content: ReactNode; className?: string };
  // Lets a wrapping preference row toggle the menu (Compose: the whole
  // BasicComponent row is the click target, not just the value/arrow cluster).
  registerToggle?: (toggle: (() => void) | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [childMenu, setChildMenu] = useState<{
    key: string;
    items: NormDropdownItem[];
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  // Fixed-position placement for the portaled popup. Mirrors Compose
  // ListPopupDefaults.dropdownPositionProvider: right-aligned (Align.End), and
  // flips above / centers when there isn't enough room below.
  const [menuPos, setMenuPos] = useState<{
    right: number;
    top?: number;
    bottom?: number;
    placement: "below" | "above" | "middle";
  } | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Bumped on every open so the enter keyframe restarts (React remounts the node).
  const [openSeq, setOpenSeq] = useState(0);
  const themeStyle = usePortalThemeStyle();

  const setExpanded = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) setChildMenu(null);
      onExpandedChange?.(next);
    },
    [onExpandedChange],
  );

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setExpanded(false);
      setIsExiting(false);
    }, dialog ? DIALOG_EXIT_MS : 150);
  }, [dialog, setExpanded]);

  // Compute the right-aligned, above/below/middle placement for a given anchor
  // rect and popup height (Compose dropdownPositionProvider, verticalMargin 8).
  const computePlacement = (rect: DOMRect, menuH: number, menuW: number) => {
    const VM = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // X: right edge aligned to the trigger, clamped into the viewport.
    let x = rect.right - menuW;
    x = Math.max(0, Math.min(x, vw - menuW));
    const right = Math.round(vw - (x + menuW));
    if (vh - rect.bottom > menuH) {
      return { right, top: Math.round(rect.bottom + VM), placement: "below" as const };
    }
    if (rect.top > menuH) {
      return { right, bottom: Math.round(vh - rect.top + VM), placement: "above" as const };
    }
    // Middle: vertically center on the anchor, clamped.
    let top = rect.top + rect.height / 2 - menuH / 2;
    top = Math.max(VM, Math.min(top, vh - menuH - VM));
    return { right, top: Math.round(top), placement: "middle" as const };
  };

  const openMenu = () => {
    if (!dialog) {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) {
        // Pre-position from an estimated height so the very first commit is already
        // placed (lets the enter animation run from frame 0). The layout effect
        // below refines it with the real measured height.
        const estH = Math.min(rect.height * Math.max(groups.reduce((n, g) => n + g.items.length, 0), 1) + 40, window.innerHeight - 16);
        setMenuPos(computePlacement(rect, estH, rect.width));
      }
    }
    setOpenSeq((seq) => seq + 1);
    setExpanded(true);
  };

  // After the popup mounts, re-measure its real height and finalize placement.
  useLayoutEffect(() => {
    if (!open || dialog) return;
    const menuEl = menuRef.current;
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!menuEl || !rect) return;
    setMenuPos(computePlacement(rect, menuEl.offsetHeight, menuEl.offsetWidth));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Expose the toggle so the wrapping preference ROW can open/close the menu.
  useEffect(() => {
    if (!registerToggle) return undefined;
    registerToggle(() => {
      if (open) {
        handleClose();
      } else if (enabled) {
        openMenu();
      }
    });
    return () => registerToggle(null);
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  const handleSelect = (item: NormDropdownItem) => {
    if (!item.enabled) return;
    if (item.children?.length) return;
    item.onSelect();
    // Close on selection when collapseOnSelection: single-group popups AND
    // single-group "As Dialog" rows close on tap (Compose default true), while
    // multi-group rows (false) stay open until the confirm button / scrim.
    if (collapseOnSelection) handleClose();
  };

  const openChildMenu = (key: string, item: NormDropdownItem, element: HTMLElement) => {
    if (!item.children?.length) {
      setChildMenu(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    const menuW = 220;
    const gap = 8;
    const canOpenRight = rect.right + gap + menuW <= window.innerWidth;
    const top = Math.max(8, Math.min(rect.top, window.innerHeight - 8 - Math.min(item.children.length * 56 + 40, window.innerHeight - 16)));
    setChildMenu({
      key,
      items: item.children,
      top: Math.round(top),
      ...(canOpenRight ? { left: Math.round(rect.right + gap) } : { right: Math.round(window.innerWidth - rect.left + gap) }),
    });
  };

  // Group rows separated by a divider, mirroring DropdownEntriesPopupContent.
  const renderRows = (rowGroups: NormDropdownGroup[], child = false) => rowGroups.map((group, groupIndex) => (
    <Fragment key={groupIndex}>
      {groupIndex > 0 && <div className="miuix-dropdown-menu__divider" aria-hidden />}
      {group.items.map((item, itemIndex) => (
        <button
          key={itemIndex}
          type="button"
          role="option"
          aria-selected={item.selected}
          disabled={!item.enabled}
          className={cx(
            "miuix-menu-item",
            spinner && "miuix-menu-item--spinner",
            item.selected && "miuix-menu-item--selected",
            !item.enabled && "miuix-menu-item--disabled",
            Boolean(item.children?.length) && "miuix-menu-item--submenu",
          )}
          onMouseEnter={(event) => !child && openChildMenu(`${groupIndex}-${itemIndex}`, item, event.currentTarget)}
          onFocus={(event) => !child && openChildMenu(`${groupIndex}-${itemIndex}`, item, event.currentTarget)}
          onClick={(event) => {
            if (item.children?.length) {
              openChildMenu(`${groupIndex}-${itemIndex}`, item, event.currentTarget);
              return;
            }
            handleSelect(item);
          }}
        >
          {spinner && item.color && <span className="miuix-menu-item__swatch" style={{ background: item.color }} />}
          <span className="miuix-menu-item__text">
            <span>{item.text}</span>
            {item.summary != null && <span className="miuix-menu-item__summary">{item.summary}</span>}
          </span>
          {/* Always reserve the check slot so selected vs unselected rows keep
              identical text columns (Compose draws a transparent check). */}
          {item.children?.length ? (
            <BasicArrowRightIcon className="miuix-menu-item__check miuix-menu-item__chevron" />
          ) : item.selected ? (
            <Icon className="miuix-menu-item__check" icon="check" size={20} />
          ) : (
            <span className="miuix-menu-item__check" aria-hidden />
          )}
        </button>
      ))}
    </Fragment>
  ));
  const rows = renderRows(groups);

  // Grouped selections join with newlines (Compose joinToString("\n")), so allow wrapping.
  const multiline = typeof valueText === "string" && valueText.includes("\n");

  return (
    <div className={cx("miuix-dropdown", open && "miuix-dropdown--open")}>
      <button
        ref={anchorRef}
        type="button"
        className={
          iconTrigger
            ? cx("miuix-icon-button", "miuix-icon-dropdown-menu__button", open && "miuix-icon-dropdown-menu__button--open", iconTrigger.className)
            : "miuix-dropdown__button miuix-dropdown__button--flat"
        }
        disabled={!enabled}
        aria-label={iconTrigger?.label}
        title={iconTrigger?.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          if (open) {
            handleClose();
          } else {
            openMenu();
          }
        }}
      >
        {iconTrigger ? (
          iconTrigger.content
        ) : (
          <>
            {valueText != null && valueText !== "" && (
              <span className="miuix-dropdown__value" style={multiline ? { whiteSpace: "pre-line" } : undefined}>
                {valueText}
              </span>
            )}
            <BasicArrowUpDownIcon className="miuix-dropdown-arrow" />
          </>
        )}
      </button>
      {open && !dialog && menuPos &&
        createPortal(
          <div className={cx("miuix-dropdown-portal", isExiting && "miuix-dropdown-portal--exiting")} style={themeStyle}>
            {/* Full-screen scrim that dims the background AS the menu opens
                (Compose ListPopup dimProgress) and dismisses on click. */}
            <div className="miuix-dropdown-scrim" onMouseDown={handleClose} aria-hidden />
            <div
              key={openSeq}
              ref={menuRef}
              className={cx(
                "miuix-dropdown-menu",
                menuPos.placement === "above" && "miuix-dropdown-menu--above",
                menuPos.placement === "middle" && "miuix-dropdown-menu--middle",
              )}
              role="listbox"
              style={
                menuPos.placement === "above"
                  ? { bottom: `${menuPos.bottom}px`, right: `${menuPos.right}px` }
                  : { top: `${menuPos.top}px`, right: `${menuPos.right}px` }
              }
            >
              {rows}
            </div>
            {childMenu && (
              <div
                key={childMenu.key}
                className="miuix-dropdown-menu miuix-dropdown-menu--cascading-child"
                role="listbox"
                style={childMenu.left != null ? { top: `${childMenu.top}px`, left: `${childMenu.left}px` } : { top: `${childMenu.top}px`, right: `${childMenu.right}px` }}
              >
                {renderRows([{ items: childMenu.items }], true)}
              </div>
            )}
          </div>,
          document.body,
        )}
      {open && dialog &&
        createPortal(
          <div
            className={cx("miuix-modal", "miuix-modal--dialog", isExiting ? "miuix-modal--exit" : "miuix-modal--enter")}
            style={themeStyle}
            onMouseDown={handleClose}
          >
            <div
              className={cx("miuix-dialog", isExiting ? "miuix-dialog--exit" : "miuix-dialog--enter")}
              role="dialog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Text variant="title4" className="miuix-dialog__title">{dialog.title}</Text>
              <div className="miuix-dropdown-dialog__list" role="listbox">
                {rows}
              </div>
              <div className="miuix-dropdown-dialog__button">
                <TextButton className="miuix-dropdown-dialog__confirm" primary text={dialog.buttonString} onClick={handleClose} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function OverlayIconDropdownMenu({
  entries,
  entry,
  enabled = true,
  collapseOnSelection,
  onExpandedChange,
  label,
  children,
}: {
  entries?: DropdownDemoEntry[];
  entry?: DropdownDemoEntry;
  enabled?: boolean;
  collapseOnSelection?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  label?: string;
  children: ReactNode;
}) {
  const groups = (entries ?? (entry ? [entry] : [])).map((group) => ({
    items: group.items.map(normalizeDropdownEntryItem),
  }));
  const actualEnabled = enabled && groups.some((group) => group.items.length > 0);

  return (
    <DropdownItemList
      groups={groups}
      valueText={null}
      enabled={actualEnabled}
      spinner={false}
      collapseOnSelection={collapseOnSelection ?? groups.length <= 1}
      onExpandedChange={onExpandedChange}
      iconTrigger={{ label: label ?? "Dropdown menu", content: children }}
    />
  );
}

export const WindowIconDropdownMenu = OverlayIconDropdownMenu;
export const OverlayIconCascadingDropdownMenu = OverlayIconDropdownMenu;
export const WindowIconCascadingDropdownMenu = OverlayIconDropdownMenu;

export function DropdownPreference({
  items,
  entries,
  selectedIndex,
  onSelectedIndexChange,
  enabled = true,
  spinner = false,
  collapseOnSelection,
  dialogButtonString,
  showValue = true,
  onExpandedChange,
  ...props
}: {
  items?: Array<DropdownDemoItem | string>;
  entries?: DropdownDemoEntry[];
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  enabled?: boolean;
  spinner?: boolean;
  collapseOnSelection?: boolean;
  // Confirm-button label; presence switches the menu to Compose "As Dialog" mode.
  dialogButtonString?: string;
  showValue?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick">) {
  // Build the normalized groups + the trigger value text from either the flat
  // (items + selectedIndex) form or the grouped (entries) form.
  let groups: NormDropdownGroup[];
  let valueText: ReactNode;
  let defaultCollapse: boolean;
  if (entries) {
    groups = entries.map((group) => ({
      items: group.items.map(normalizeDropdownEntryItem),
    }));
    // Trigger shows every group's selected item text, joined by newlines.
    valueText =
      groups
        .flatMap((group) => group.items)
        .filter((item) => item.selected && typeof item.text === "string" && item.text !== "")
        .map((item) => item.text as string)
        .join("\n") || null;
    // collapseOnSelection defaults to false for multi-group (Compose entries.size <= 1).
    defaultCollapse = entries.length <= 1;
  } else {
    const normalized = (items ?? []).map((item) => (typeof item === "string" ? { text: item } : item));
    const index = selectedIndex ?? 0;
    groups = [
      {
        items: normalized.map((item, i) => ({
          text: item.text,
          summary: item.summary,
          color: item.color,
          enabled: item.enabled !== false,
          selected: i === index,
          onSelect: () => onSelectedIndexChange?.(i),
        })),
      },
    ];
    valueText = normalized[index]?.text ?? null;
    defaultCollapse = true;
  }

  const hasItems = groups.some((group) => group.items.length > 0);
  const actualEnabled = enabled && hasItems;

  return <DropdownPreferenceRow
    {...props}
    enabled={actualEnabled}
    groups={groups}
    valueText={showValue ? valueText : null}
    spinner={spinner}
    collapseOnSelection={collapseOnSelection ?? defaultCollapse}
    dialogButtonString={dialogButtonString}
    onExpandedChange={onExpandedChange}
  />;
}

function DropdownPreferenceRow({
  groups,
  valueText,
  enabled,
  spinner,
  collapseOnSelection,
  dialogButtonString,
  onExpandedChange,
  ...props
}: {
  groups: NormDropdownGroup[];
  valueText: ReactNode;
  enabled: boolean;
  spinner: boolean;
  collapseOnSelection: boolean;
  dialogButtonString?: string;
  onExpandedChange?: (expanded: boolean) => void;
} & Omit<Parameters<typeof BasicComponent>[0], "endAction" | "endActions" | "onClick">) {
  // Compose: the whole row toggles the popup and stays hold-down highlighted
  // while it is open (BasicComponent holdDownState).
  const toggleRef = useRef<(() => void) | null>(null);
  const registerToggle = useCallback((toggle: (() => void) | null) => {
    toggleRef.current = toggle;
  }, []);
  const [expanded, setExpanded] = useState(false);
  const handleExpandedChange = useCallback(
    (next: boolean) => {
      setExpanded(next);
      onExpandedChange?.(next);
    },
    [onExpandedChange],
  );

  return (
    <BasicComponent
      {...props}
      enabled={enabled}
      onClick={enabled ? () => toggleRef.current?.() : undefined}
      holdDown={expanded}
      endAction={
        <DropdownItemList
          groups={groups}
          valueText={valueText}
          enabled={enabled}
          spinner={spinner}
          collapseOnSelection={collapseOnSelection}
          dialog={dialogButtonString != null ? { title: props.title, buttonString: dialogButtonString } : undefined}
          onExpandedChange={handleExpandedChange}
          registerToggle={registerToggle}
        />
      }
    />
  );
}

export const SpinnerPreference = (props: Omit<Parameters<typeof DropdownPreference>[0], "spinner">) => (
  <DropdownPreference spinner {...props} />
);
export const OverlayDropdownPreference = DropdownPreference;
export const WindowDropdownPreference = DropdownPreference;
export const OverlaySpinnerPreference = SpinnerPreference;
export const WindowSpinnerPreference = SpinnerPreference;

type ColorPaletteProps = {
  value: string;
  onValueChange: (value: string) => void;
  rows?: number;
  hueColumns?: number;
  includeGrayColumn?: boolean;
  showPreview?: boolean;
  cornerRadius?: number;
  indicatorRadius?: number;
  className?: string;
  style?: CSSProperties;
  // Back-compat: old React callers passed a swatch array. The official palette
  // is generated from HSV cells, so this prop is accepted but ignored.
  colors?: string[];
};

function buildPaletteRowSV(rows: number): Array<[number, number]> {
  if (rows <= 1) return [[1, 1]];
  if (rows === 7) {
    const s = [0.1, 0.35, 0.7, 1, 1, 1, 1];
    const v = [1, 1, 1, 0.85, 0.65, 0.45, 0.2];
    return s.map((item, index) => [item, v[index]]);
  }
  const topBrightCut = Math.min(0.34, 2 / (rows - 1));
  return Array.from({ length: rows }, (_, index) => {
    const t = index / (rows - 1);
    const sRamp = clamp(t / 0.35, 0, 1);
    const s = clamp(0.1 + 0.9 * sRamp, 0, 1);
    const v = t <= topBrightCut ? 1 : 1 + (0.2 - 1) * clamp((t - topBrightCut) / (1 - topBrightCut), 0, 1);
    return [s, v];
  });
}

function buildPaletteGrayV(rows: number): number[] {
  if (rows <= 1) return [1];
  return Array.from({ length: rows }, (_, index) => 1 - index / (rows - 1));
}

function paletteCellColor(
  col: number,
  row: number,
  rowSV: Array<[number, number]>,
  grayV: number[],
  hueColumns: number,
  includeGrayColumn: boolean,
): [number, number, number] {
  const totalColumns = hueColumns + (includeGrayColumn ? 1 : 0);
  if (includeGrayColumn && col === totalColumns - 1) {
    return hsvToRgb01(0, 0, grayV[row]);
  }
  const [s, v] = rowSV[row];
  return hsvToRgb01((col * 360) / hueColumns, s, v);
}

function nearestPaletteRow(targetS: number, targetV: number, rowSV: Array<[number, number]>) {
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  rowSV.forEach(([s, v], i) => {
    const d = (targetS - s) ** 2 + (targetV - v) ** 2;
    if (d < best) {
      best = d;
      index = i;
    }
  });
  return index;
}

function nearestGrayRow(targetV: number, grayV: number[]) {
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  grayV.forEach((v, i) => {
    const d = (targetV - v) ** 2;
    if (d < best) {
      best = d;
      index = i;
    }
  });
  return index;
}

function paletteHex(rgb: [number, number, number], alpha: number) {
  const base = rgb01ToHex(rgb).slice(1);
  const a = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
  if (a >= 0.999) return `#${base}`;
  return `#${base}${clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0")}`;
}

export function ColorPalette({
  value,
  onValueChange,
  rows = 7,
  hueColumns = 12,
  includeGrayColumn = true,
  showPreview = true,
  cornerRadius = 16,
  indicatorRadius = 10,
  className,
  style,
}: ColorPaletteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const safeRows = Math.max(1, Math.round(rows));
  const safeHueColumns = Math.max(1, Math.round(hueColumns));
  const totalColumns = safeHueColumns + (includeGrayColumn ? 1 : 0);
  const rowSV = useMemo(() => buildPaletteRowSV(safeRows), [safeRows]);
  const grayV = useMemo(() => buildPaletteGrayV(safeRows), [safeRows]);
  const { a: alpha } = hexToRgba(value);
  const hsv = toHsv(value);
  const isGray = includeGrayColumn && hsv.s < 0.05;
  const selectedCol = isGray
    ? totalColumns - 1
    : clamp(Math.round(((hsv.h % 360) / 360) * safeHueColumns), 0, safeHueColumns - 1);
  const selectedRow = isGray
    ? nearestGrayRow(hsv.v, grayV)
    : nearestPaletteRow(hsv.s, hsv.v, rowSV);
  const baseRgb = paletteCellColor(selectedCol, selectedRow, rowSV, grayV, safeHueColumns, includeGrayColumn);
  const previewColor = rgba01ToCss(baseRgb, alpha);

  useEffect(() => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return undefined;

    const draw = () => {
      const width = grid.clientWidth;
      const height = grid.clientHeight;
      if (width <= 0 || height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (let row = 0; row < safeRows; row += 1) {
        const top = Math.floor((row * height) / safeRows);
        const bottom = Math.floor(((row + 1) * height) / safeRows);
        for (let col = 0; col < totalColumns; col += 1) {
          const left = Math.floor((col * width) / totalColumns);
          const right = Math.floor(((col + 1) * width) / totalColumns);
          ctx.fillStyle = rgb01ToHex(paletteCellColor(col, row, rowSV, grayV, safeHueColumns, includeGrayColumn));
          ctx.fillRect(left, top, right - left, bottom - top);
        }
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [grayV, includeGrayColumn, rowSV, safeHueColumns, safeRows, totalColumns]);

  const selectCell = (clientX: number, clientY: number) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const x = clamp(clientX - rect.left, 0, rect.width - 1);
    const y = clamp(clientY - rect.top, 0, rect.height - 1);
    const col = clamp(Math.floor((x / rect.width) * totalColumns), 0, totalColumns - 1);
    const row = clamp(Math.floor((y / rect.height) * safeRows), 0, safeRows - 1);
    onValueChange(paletteHex(paletteCellColor(col, row, rowSV, grayV, safeHueColumns, includeGrayColumn), alpha));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    selectCell(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    selectCell(event.clientX, event.clientY);
  };

  return (
    <div className={cx("miuix-color-palette", className)} style={style}>
      {showPreview && <span className="miuix-color-palette__preview" style={{ background: previewColor }} />}
      <div
        ref={gridRef}
        className="miuix-color-palette__grid"
        style={{ borderRadius: cornerRadius }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <canvas ref={canvasRef} className="miuix-color-palette__canvas" aria-hidden />
        <span
          className="miuix-color-palette__indicator"
          style={{
            left: `${((selectedCol + 0.5) / totalColumns) * 100}%`,
            top: `${((selectedRow + 0.5) / safeRows) * 100}%`,
            width: indicatorRadius * 2,
            height: indicatorRadius * 2,
          }}
          aria-hidden
        />
      </div>
      <ColorSlider
        ariaLabel="透明度"
        value={alpha}
        checkerboard
        stops={[rgba01ToCss(baseRgb, 0), rgba01ToCss(baseRgb, 1)]}
        onValueChange={(nextAlpha) => onValueChange(paletteHex(baseRgb, nextAlpha))}
      />
    </div>
  );
}

type ColorSpaceName = "HSV" | "OKHSV" | "OKLAB" | "OKLCH";

// Build a CSS linear-gradient inset by 13px on each side, matching Kotlin
// ColorSlider Brush.horizontalGradient(startX = 13, endX = width - 13).
function colorSliderGradient(stops: string[]): string {
  if (stops.length === 1) return stops[0];
  const inner = stops
    .map((color, i) => {
      const t = i / (stops.length - 1);
      const pos = `calc(13px + (100% - 26px) * ${t})`;
      return `${color} ${pos}`;
    })
    .join(", ");
  return `linear-gradient(to right, ${inner})`;
}

// 36-stop HSV rainbow (Transforms.generateHsvHueColors): Hsv(i/36*360,100,100), i=0..35.
function hsvHueStops(): string[] {
  const out: string[] = [];
  for (let i = 0; i < 36; i++) out.push(rgb01ToHex(hsvToRgb01((i / 36) * 360, 1, 1)));
  return out;
}

// 36-stop OkHSV rainbow (Transforms.generateOkHsvHueColors): okhsvToColor(i/36,1,1), i=0..35.
function okHsvHueStops(): string[] {
  const out: string[] = [];
  for (let i = 0; i < 36; i++) out.push(rgb01ToHex(okhsvToRgb01(i / 36, 1, 1)));
  return out;
}

// 36-stop OkLch hue ramp at fixed l (0..1) and c (0..1 -> *0.4 internal), i=0..35.
function okLchHueStops(l: number, c: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < 36; i++) out.push(rgb01ToHex(okLchInternalToRgb01(l, c * 0.4, (i / 36) * 360)));
  return out;
}

type ColorSliderProps = {
  value: number; // 0..1
  onValueChange: (value: number) => void;
  stops: string[];
  checkerboard?: boolean;
  ariaLabel: string;
};

// Generic gradient capsule slider with a ring thumb (Kotlin ColorSlider).
function ColorSlider({ value, onValueChange, stops, checkerboard, ariaLabel }: ColorSliderProps) {
  const v = clamp(value, 0, 1);
  // center = value * (width - 26) + 13 (Kotlin indicatorPositionPx).
  const center = `calc(13px + (100% - 26px) * ${v})`;
  return (
    <div
      className={cx("miuix-color-slider", checkerboard && "miuix-color-slider--checker")}
      style={{
        "--miuix-color-slider-gradient": colorSliderGradient(stops),
        "--miuix-color-slider-center": center,
      } as CSSProperties}
    >
      <span className="miuix-color-slider__track" aria-hidden />
      <span className="miuix-color-slider__thumb" aria-hidden />
      <input
        type="range"
        className="miuix-color-slider__input"
        min={0}
        max={1}
        step={0.0001}
        value={v}
        aria-label={ariaLabel}
        onChange={(event) => onValueChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}

export type ColorPickerProps = {
  value: string; // hex, #RRGGBB or #RRGGBBAA
  onValueChange: (value: string) => void;
  colorSpace?: ColorSpaceName;
  showPreview?: boolean;
  // Back-compat alias for showPreview (older callers used showHex=false to hide).
  showHex?: boolean;
  className?: string;
  style?: CSSProperties;
};

// Compose the current hex string. #RRGGBB at alpha 1, else #RRGGBBAA. NaN-safe.
function composeHex(rgb: [number, number, number], alpha: number): string {
  const base = rgb01ToHex(rgb).slice(1); // RRGGBB
  const a = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
  if (a >= 0.999) return `#${base}`;
  return `#${base}${clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0")}`;
}

// Alpha- and case-insensitive hex normalization (Kotlin compares toArgb() ints).
function normalizeHex(hex: string): string {
  const { r, g, b, a } = hexToRgba(hex);
  const p = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `${p(r)}${p(g)}${p(b)}${p(clamp(a, 0, 1) * 255)}`;
}

// hex sRGB byte -> OkLab internal (l 0..1, a/b ±0.4) without the 100x/0.4 round-trip.
function okLabFromHex(r: number, g: number, b: number): OkLabColor {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = lin(r / 255), lg = lin(g / 255), lb = lin(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    l: clamp(0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 0, 1),
    a: clamp(1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, -0.4, 0.4),
    b: clamp(0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s, -0.4, 0.4),
  };
}

// hex sRGB byte -> OkLch internal (l 0..1, c 0..1 of 0.4, h 0..1 of 360).
function okLchFromHex(r: number, g: number, b: number): OkLchColor {
  const lab = okLabFromHex(r, g, b);
  const cRaw = Math.sqrt(lab.a * lab.a + lab.b * lab.b); // 0..0.4-ish
  let hDeg = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (hDeg < 0) hDeg += 360;
  return {
    l: clamp(lab.l, 0, 1),
    c: clamp(cRaw / 0.4, 0, 1),
    h: (((hDeg % 360) + 360) % 360) / 360,
  };
}

export function ColorPicker({
  value,
  onValueChange,
  colorSpace = "HSV",
  showPreview = true,
  showHex,
  className,
  style,
}: ColorPickerProps) {
  const previewVisible = showHex === undefined ? showPreview : showHex;

  // Channel tuple is the source of truth between renders (mirrors Kotlin
  // mutableFloatStateOf). Layout per space:
  //   HSV:   [h 0..360, s 0..1, v 0..1, alpha]
  //   OKHSV: [h 0..1,  s 0..1, v 0..1, alpha]
  //   OKLAB: [l 0..1,  a +/-0.4, b +/-0.4, alpha]
  //   OKLCH: [l 0..1,  c 0..1, h 0..1, alpha]
  const seed = (hex: string): [number, number, number, number] => {
    const { r, g, b, a } = hexToRgba(hex);
    const alpha = clamp(a, 0, 1);
    if (colorSpace === "OKHSV") {
      const hsv = rgb01ToOkhsv(r / 255, g / 255, b / 255);
      return [clamp(hsv.h, 0, 1), clamp(hsv.s, 0, 1), clamp(hsv.v, 0, 1), alpha];
    }
    if (colorSpace === "OKLAB") {
      const lab = okLabFromHex(r, g, b);
      return [clamp(lab.l, 0, 1), clamp(lab.a, -0.4, 0.4), clamp(lab.b, -0.4, 0.4), alpha];
    }
    if (colorSpace === "OKLCH") {
      const lch = okLchFromHex(r, g, b);
      return [clamp(lch.l, 0, 1), clamp(lch.c, 0, 1), clamp(lch.h, 0, 1), alpha];
    }
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min;
    let hRaw = 0;
    if (delta !== 0) {
      hRaw = max === rn
        ? 60 * (((gn - bn) / delta) % 6)
        : max === gn
          ? 60 * ((bn - rn) / delta + 2)
          : 60 * ((rn - gn) / delta + 4);
    }
    return [(hRaw + 360) % 360, max === 0 ? 0 : delta / max, max, alpha];
  };

  const tupleToHex = (c: [number, number, number, number]): string => {
    if (colorSpace === "OKHSV") return composeHex(okhsvToRgb01(c[0], c[1], c[2]), c[3]);
    if (colorSpace === "OKLAB") return composeHex(okLabInternalToRgb01(c[0], c[1], c[2]), c[3]);
    if (colorSpace === "OKLCH") return composeHex(okLchInternalToRgb01(c[0], c[1] * 0.4, c[2] * 360), c[3]);
    return composeHex(hsvToRgb01(c[0], c[1], c[2]), c[3]);
  };

  const [channels, setChannels] = useState<[number, number, number, number]>(() => seed(value));
  // Track the last external value we applied (mirrors lastAppliedExternalColorArgb).
  const lastExternal = useRef(value);

  // Re-seed only when an external value arrives that does not round-trip to our
  // current internal color (Kotlin SideEffect guard). setState is deferred via
  // requestAnimationFrame to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    const internalHex = tupleToHex(channels);
    if (
      normalizeHex(value) !== normalizeHex(lastExternal.current) &&
      normalizeHex(value) !== normalizeHex(internalHex)
    ) {
      const raf = requestAnimationFrame(() => {
        lastExternal.current = value;
        setChannels(seed(value));
      });
      return () => cancelAnimationFrame(raf);
    }
    lastExternal.current = value;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, colorSpace]);

  const setChannel = (index: 0 | 1 | 2 | 3, next: number) => {
    const updated: [number, number, number, number] = [channels[0], channels[1], channels[2], channels[3]];
    updated[index] = next;
    const hex = tupleToHex(updated);
    lastExternal.current = hex; // our own emission must not trigger a re-seed
    setChannels(updated);
    onValueChange(hex);
  };

  const [c0, c1, c2, alpha] = channels;
  let body: ReactNode;
  let previewColor: string;

  if (colorSpace === "OKHSV") {
    const h = c0, s = c1, val = c2;
    previewColor = rgba01ToCss(okhsvToRgb01(h, s, val), alpha);
    body = (
      <>
        <ColorSlider ariaLabel="色相" value={h} stops={okHsvHueStops()} onValueChange={(nv) => setChannel(0, nv)} />
        <ColorSlider ariaLabel="饱和度" value={s} stops={[rgb01ToHex(okhsvToRgb01(h, 0, 1)), rgb01ToHex(okhsvToRgb01(h, 1, 1))]} onValueChange={(nv) => setChannel(1, nv)} />
        <ColorSlider ariaLabel="明度" value={val} stops={[rgb01ToHex(okhsvToRgb01(h, s, 0)), rgb01ToHex(okhsvToRgb01(h, s, 1))]} onValueChange={(nv) => setChannel(2, nv)} />
        <ColorSlider ariaLabel="透明度" value={alpha} checkerboard stops={[rgba01ToCss(okhsvToRgb01(h, s, val), 0), rgba01ToCss(okhsvToRgb01(h, s, val), 1)]} onValueChange={(nv) => setChannel(3, nv)} />
      </>
    );
  } else if (colorSpace === "OKLAB") {
    const l = c0, ca = c1, cb = c2;
    previewColor = rgba01ToCss(okLabInternalToRgb01(l, ca, cb), alpha);
    const lightnessStops: string[] = [];
    for (let i = 0; i <= 7; i++) lightnessStops.push(rgb01ToHex(okLabInternalToRgb01(i / 7, ca, cb)));
    const aStops: string[] = [];
    for (let i = 0; i <= 8; i++) aStops.push(rgb01ToHex(okLabInternalToRgb01(l, -0.3 + 0.6 * (i / 8), cb)));
    const bStops: string[] = [];
    for (let i = 0; i <= 8; i++) bStops.push(rgb01ToHex(okLabInternalToRgb01(l, ca, -0.3 + 0.6 * (i / 8))));
    body = (
      <>
        <ColorSlider ariaLabel="亮度" value={l} stops={lightnessStops} onValueChange={(nv) => setChannel(0, nv)} />
        <ColorSlider ariaLabel="A 通道" value={(ca + 0.3) / 0.6} stops={aStops} onValueChange={(nv) => setChannel(1, nv * 0.6 - 0.3)} />
        <ColorSlider ariaLabel="B 通道" value={(cb + 0.3) / 0.6} stops={bStops} onValueChange={(nv) => setChannel(2, nv * 0.6 - 0.3)} />
        <ColorSlider ariaLabel="透明度" value={alpha} checkerboard stops={[rgba01ToCss(okLabInternalToRgb01(l, ca, cb), 0), rgba01ToCss(okLabInternalToRgb01(l, ca, cb), 1)]} onValueChange={(nv) => setChannel(3, nv)} />
      </>
    );
  } else if (colorSpace === "OKLCH") {
    const l = c0, c = c1, h = c2;
    previewColor = rgba01ToCss(okLchInternalToRgb01(l, c * 0.4, h * 360), alpha);
    body = (
      <>
        <ColorSlider ariaLabel="色相" value={h} stops={okLchHueStops(l, c)} onValueChange={(nv) => setChannel(2, nv)} />
        <ColorSlider ariaLabel="亮度" value={l} stops={[rgb01ToHex(okLchInternalToRgb01(0, c * 0.4, h * 360)), rgb01ToHex(okLchInternalToRgb01(1, c * 0.4, h * 360))]} onValueChange={(nv) => setChannel(0, nv)} />
        <ColorSlider ariaLabel="彩度" value={c} stops={[rgb01ToHex(okLchInternalToRgb01(l, 0, h * 360)), rgb01ToHex(okLchInternalToRgb01(l, 0.4, h * 360))]} onValueChange={(nv) => setChannel(1, nv)} />
        <ColorSlider ariaLabel="透明度" value={alpha} checkerboard stops={[rgba01ToCss(okLchInternalToRgb01(l, c * 0.4, h * 360), 0), rgba01ToCss(okLchInternalToRgb01(l, c * 0.4, h * 360), 1)]} onValueChange={(nv) => setChannel(3, nv)} />
      </>
    );
  } else {
    const h = c0, s = c1, val = c2; // HSV: h 0..360
    previewColor = rgba01ToCss(hsvToRgb01(h, s, val), alpha);
    body = (
      <>
        <ColorSlider ariaLabel="色相" value={h / 360} stops={hsvHueStops()} onValueChange={(nv) => setChannel(0, nv * 360)} />
        <ColorSlider ariaLabel="饱和度" value={s} stops={[rgb01ToHex(hsvToRgb01(h, 0, 1)), rgb01ToHex(hsvToRgb01(h, 1, 1))]} onValueChange={(nv) => setChannel(1, nv)} />
        <ColorSlider ariaLabel="明度" value={val} stops={["#000000", rgb01ToHex(hsvToRgb01(h, s, 1))]} onValueChange={(nv) => setChannel(2, nv)} />
        <ColorSlider ariaLabel="透明度" value={alpha} checkerboard stops={[rgba01ToCss(hsvToRgb01(h, s, val), 0), rgba01ToCss(hsvToRgb01(h, s, val), 1)]} onValueChange={(nv) => setChannel(3, nv)} />
      </>
    );
  }

  return (
    <div className={cx("miuix-color-picker", className)} style={style}>
      {previewVisible && <span className="miuix-color-picker__preview" style={{ background: previewColor }} />}
      {body}
    </div>
  );
}

export const HsvColorPicker = (props: Omit<ColorPickerProps, "colorSpace">) => <ColorPicker {...props} colorSpace="HSV" />;
export const OkHsvColorPicker = (props: Omit<ColorPickerProps, "colorSpace">) => <ColorPicker {...props} colorSpace="OKHSV" />;
export const OkLabColorPicker = (props: Omit<ColorPickerProps, "colorSpace">) => <ColorPicker {...props} colorSpace="OKLAB" />;
export const OkLchColorPicker = (props: Omit<ColorPickerProps, "colorSpace">) => <ColorPicker {...props} colorSpace="OKLCH" />;
export const HsvHueSlider = Slider;
export const HsvSaturationSlider = Slider;
export const HsvValueSlider = Slider;
export const HsvAlphaSlider = Slider;
export const OkHsvHueSlider = Slider;
export const OkHsvSaturationSlider = Slider;
export const OkHsvValueSlider = Slider;
export const OkHsvAlphaSlider = Slider;
export const OkLchLightnessSlider = Slider;
export const OkLchChromaSlider = Slider;
export const OkLchHueSlider = Slider;
export const OkLchAlphaSlider = Slider;
export const OkLabLightnessSlider = Slider;
export const OkLabAChannelSlider = Slider;
export const OkLabBChannelSlider = Slider;
export const OkLabAlphaSlider = Slider;

// Snackbar duration: "short" (4s), "long" (10s), "indefinite", or a custom ms.
export type SnackbarDuration = "short" | "long" | "indefinite" | number;

export type ShowSnackbarOptions = {
  duration?: SnackbarDuration;
  actionLabel?: ReactNode;
  withDismissAction?: boolean;
};

type SnackbarItem = {
  id: number;
  message: ReactNode;
  actionLabel?: ReactNode;
  withDismissAction?: boolean;
  resolve?: (result: SnackbarResult) => void;
  timer?: number;
  exiting?: boolean;
};

// Exit animation duration in ms. Mirrors Compose's
// shrinkVertically(spring(stiffness = Spring.StiffnessMediumLow)) (~350ms,
// critically damped). Must match the .miuix-snackbar-slot--exiting CSS below.
const SNACKBAR_EXIT_MS = 320;

type SnackbarContextValue = {
  // Returns a promise resolving with the result (dismissed / actionPerformed),
  // mirroring the Compose SnackbarHostState.showSnackbar return.
  showSnackbar: (message: ReactNode, options?: ShowSnackbarOptions) => Promise<SnackbarResult>;
  dismissOldest: () => void;
  dismissNewest: () => void;
};

function snackbarDurationMs(duration: SnackbarDuration | undefined): number | null {
  if (duration === "indefinite") return null;
  if (duration === "long") return 10000;
  if (typeof duration === "number") return duration;
  return 4000; // "short" / default
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

let snackbarIdSeq = 0;

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SnackbarItem[]>([]);

  // Mark an item as exiting (plays the slide-down/shrink exit animation),
  // resolve its promise, then remove it after the animation completes.
  const finalize = useCallback((id: number, result: SnackbarResult) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (!target || target.exiting) return current;
      if (target.timer) window.clearTimeout(target.timer);
      target.resolve?.(result);
      // Schedule the actual removal after the exit animation duration.
      window.setTimeout(() => {
        setItems((latest) => latest.filter((item) => item.id !== id));
      }, SNACKBAR_EXIT_MS);
      return current.map((item) => (item.id === id ? { ...item, exiting: true, timer: undefined } : item));
    });
  }, []);

  const showSnackbar = useCallback(
    (message: ReactNode, options?: ShowSnackbarOptions) =>
      new Promise<SnackbarResult>((resolve) => {
        const id = ++snackbarIdSeq;
        const ms = snackbarDurationMs(options?.duration);
        const timer = ms == null ? undefined : window.setTimeout(() => finalize(id, "dismissed"), ms);
        setItems((current) => [
          ...current,
          { id, message, actionLabel: options?.actionLabel, withDismissAction: options?.withDismissAction, resolve, timer, exiting: false },
        ]);
      }),
    [finalize],
  );

  // Compose oldestSnackbarData() = entries.lastOrNull { it.visible }. Kotlin
  // entries are prepended (newest first); React items are appended (oldest
  // first), so "oldest" = first non-exiting item. Read the rendered snapshot in
  // this event handler (allowed) and call finalize once.
  const dismissOldest = useCallback(() => {
    const oldest = items.find((item) => !item.exiting);
    if (oldest) finalize(oldest.id, "dismissed");
  }, [items, finalize]);

  // Compose newestSnackbarData() = entries.firstOrNull { it.visible } = newest.
  // React newest = last non-exiting item.
  const dismissNewest = useCallback(() => {
    let newest: SnackbarItem | undefined;
    for (const item of items) {
      if (!item.exiting) newest = item;
    }
    if (newest) finalize(newest.id, "dismissed");
  }, [items, finalize]);

  const value = useMemo(() => ({ showSnackbar, dismissOldest, dismissNewest }), [showSnackbar, dismissOldest, dismissNewest]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div className="miuix-snackbar-host">
        {items.map((item) => (
          <div key={item.id} className={cx("miuix-snackbar-slot", item.exiting && "miuix-snackbar-slot--exiting")}>
            <Snackbar
              action={item.actionLabel != null ? <button type="button" className="miuix-snackbar__action" onClick={() => finalize(item.id, "actionPerformed")}>{item.actionLabel}</button> : undefined}
              onDismiss={item.withDismissAction ? () => finalize(item.id, "dismissed") : undefined}
            >
              {item.message}
            </Snackbar>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used inside SnackbarProvider.");
  }
  return context;
}

// Alias matching the Compose name; returns the same host-state-like object.
export const useSnackbarHostState = useSnackbar;

export function Snackbar({ children, action, onDismiss }: { children: ReactNode; action?: ReactNode; onDismiss?: () => void }) {
  return (
    <div className="miuix-snackbar">
      <span className="miuix-snackbar__message">{children}</span>
      {action && <span className="miuix-snackbar__action-slot">{action}</span>}
      {onDismiss && (
        <button type="button" className="miuix-snackbar__close" aria-label="关闭" onClick={onDismiss}>
          <Icon icon="close" size={24} />
        </button>
      )}
    </div>
  );
}

export function PullToRefresh({ refreshing, onRefresh, children }: { refreshing: boolean; onRefresh: () => void; children: ReactNode }) {
  return (
    <div className="miuix-pull-to-refresh">
      <Button variant="text" onClick={onRefresh}>{refreshing ? "刷新中" : "刷新"}</Button>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge (ported from Kotlin Badge.kt)
// ---------------------------------------------------------------------------

export function Badge({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cx("miuix-badge", children != null && "miuix-badge--content", className)}>
      {children}
    </span>
  );
}

export function BadgedBox({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <span className="miuix-badged-box">
      {children}
      <span className="miuix-badged-box__badge">{badge}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tooltip (ported from Kotlin Tooltip.kt: plain + rich)
// ---------------------------------------------------------------------------

const TOOLTIP_HOVER_DELAY_MS = 500;

// Anchor position for a portaled tooltip: the anchor's top-center in viewport
// coordinates. Portaling to <body> keeps the tooltip above every card (the
// demo cards clip their children with overflow: hidden).
type TooltipPos = { x: number; y: number };

function tooltipPosFor(element: HTMLElement | null): TooltipPos | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top };
}

// Close the tooltip when the page scrolls so it never drifts off its anchor.
function useTooltipDismiss(show: boolean, hide: () => void) {
  useEffect(() => {
    if (!show) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", hide, { capture: true });
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [show, hide]);
}

export function TooltipBox({ text, children }: { text: ReactNode; children: ReactNode }) {
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const timerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const themeStyle = usePortalThemeStyle();

  const cancel = () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const hide = useCallback(() => setPos(null), []);

  useEffect(() => cancel, []);
  useTooltipDismiss(pos != null, hide);

  return (
    <span
      ref={rootRef}
      className="miuix-tooltip-anchor"
      onMouseEnter={() => {
        cancel();
        timerRef.current = window.setTimeout(() => setPos(tooltipPosFor(rootRef.current)), TOOLTIP_HOVER_DELAY_MS);
      }}
      onMouseLeave={() => {
        cancel();
        hide();
      }}
      onFocus={() => setPos(tooltipPosFor(rootRef.current))}
      onBlur={hide}
    >
      {children}
      {pos != null &&
        createPortal(
          <span
            className="miuix-tooltip-layer"
            style={mergeStyles({ left: pos.x, top: pos.y }, themeStyle)}
          >
            <span className="miuix-tooltip miuix-tooltip--plain" role="tooltip">
              {text}
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}

export function RichTooltipBox({
  title,
  text,
  actionText,
  onActionClick,
  children,
}: {
  title?: ReactNode;
  text: ReactNode;
  actionText?: ReactNode;
  onActionClick?: () => void;
  children: ReactNode;
}) {
  // Kotlin demo uses rememberTooltipState(isPersistent = true): the tooltip
  // toggles on tap and stays until dismissed by tapping outside.
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const themeStyle = usePortalThemeStyle();
  const hide = useCallback(() => setPos(null), []);

  useTooltipDismiss(pos != null, hide);

  useEffect(() => {
    if (pos == null) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !layerRef.current?.contains(target)) hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pos, hide]);

  return (
    <span
      ref={rootRef}
      className="miuix-tooltip-anchor"
      onClick={() => setPos((current) => (current ? null : tooltipPosFor(rootRef.current)))}
    >
      {children}
      {pos != null &&
        createPortal(
          <span
            ref={layerRef}
            className="miuix-tooltip-layer miuix-tooltip-layer--interactive"
            style={mergeStyles({ left: pos.x, top: pos.y }, themeStyle)}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="miuix-tooltip miuix-tooltip--rich" role="tooltip">
              {title != null && <span className="miuix-tooltip__title">{title}</span>}
              <span className="miuix-tooltip__text">{text}</span>
              {actionText != null && (
                <button
                  type="button"
                  className="miuix-tooltip__action"
                  onClick={() => {
                    onActionClick?.();
                    hide();
                  }}
                >
                  {actionText}
                </button>
              )}
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}

export function rememberTooltipState() {
  return {};
}

// ---------------------------------------------------------------------------
// BreadcrumbBar (ported from Kotlin BreadcrumbBar.kt)
// ---------------------------------------------------------------------------

export type BreadcrumbItem = {
  path: string;
  text?: string;
};

export function joinToPath(items: BreadcrumbItem[], separator = "/"): string {
  return items.map((item) => item.path).join(separator);
}

export function BreadcrumbBar({
  items,
  onItemClick,
  highlightIndex = items.length - 1,
  enabled = true,
  className,
}: {
  items: BreadcrumbItem[];
  onItemClick: (index: number) => void;
  highlightIndex?: number;
  enabled?: boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasHighlight = highlightIndex >= 0;

  // Kotlin: scroll so the highlighted capsule is centered in the viewport.
  useEffect(() => {
    if (!hasHighlight) return;
    const root = scrollRef.current;
    const target = root?.querySelectorAll<HTMLElement>(".miuix-breadcrumb__item")[highlightIndex];
    if (!root || !target) return;
    const left = target.offsetLeft - (root.clientWidth - target.offsetWidth) / 2;
    root.scrollTo({ left: Math.max(0, Math.min(left, root.scrollWidth - root.clientWidth)), behavior: "smooth" });
  }, [highlightIndex, hasHighlight]);

  return (
    <div ref={scrollRef} className={cx("miuix-breadcrumb", !enabled && "miuix-breadcrumb--disabled", className)}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <BasicArrowRightIcon className="miuix-breadcrumb__separator" />}
          <button
            type="button"
            className={cx(
              "miuix-breadcrumb__item",
              hasHighlight && index === highlightIndex && "miuix-breadcrumb__item--highlight",
            )}
            disabled={!enabled}
            onClick={() => onItemClick(index)}
          >
            {item.text ?? item.path}
          </button>
        </Fragment>
      ))}
    </div>
  );
}

export function rememberPullToRefreshState() {
  return {
    distanceFraction: 0,
    isRefreshing: false,
  } satisfies PullToRefreshState;
}

export function ScrollBar({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  return <span className={cx("miuix-scrollbar", `miuix-scrollbar--${orientation}`)} />;
}

export const VerticalScrollBar = () => <ScrollBar orientation="vertical" />;
export const HorizontalScrollBar = () => <ScrollBar orientation="horizontal" />;

export function rememberScrollBarAdapter() {
  return {
    scrollOffset: 0,
    contentSize: 0,
    viewportSize: 0,
  };
}
