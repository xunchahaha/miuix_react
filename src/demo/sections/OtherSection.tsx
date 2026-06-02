// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowPreference, useSnackbar } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

/**
 * Mirrors `LazyListScope.otherPageSection()` in
 * example/shared/.../component/OtherPageSection.kt.
 *
 * The Kotlin original calls `navigator.push(Route.X)` for each row. The React
 * demo has no router / sub-pages, so by default each row surfaces a snackbar
 * describing the navigation target. The "导航测试" row mirrors the Kotlin
 * `Route.Navigation(Random.nextLong().toString())` by generating a random id.
 *
 * `onNavigate` stays an optional prop: when a host supplies one (e.g. a future
 * router) it overrides the default snackbar behaviour.
 */
export function OtherSection({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const snackbar = useSnackbar();

  // Faithful port of Kotlin `Random.nextLong().toString()`. JS numbers cannot
  // represent the full signed 64-bit range exactly, so build the decimal string
  // from two 32-bit halves to avoid precision loss / scientific notation.
  const randomNavigationId = () => {
    const hi = Math.floor(Math.random() * 0x100000000); // unsigned 32-bit
    const lo = Math.floor(Math.random() * 0x100000000); // unsigned 32-bit
    const negative = hi >= 0x80000000;
    let value = (BigInt(hi & 0x7fffffff) << 32n) | BigInt(lo);
    if (negative) {
      value -= 1n << 63n;
    }
    return value.toString();
  };

  const navigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
      return;
    }
    if (route === "pullToRefresh") {
      void snackbar.showSnackbar("跳转到下拉刷新页面");
    } else if (route === "navigation") {
      void snackbar.showSnackbar(`跳转到导航页面 (id: ${randomNavigationId()})`);
    } else if (route === "multiScaffold") {
      void snackbar.showSnackbar("跳转到多脚手架页面");
    }
  };

  return (
    <DemoSection title="其他">
      <DemoCard>
        <ArrowPreference title="下拉刷新测试" summary="跳转到下拉刷新页面" onClick={() => navigate("pullToRefresh")} />
        <ArrowPreference title="导航测试" summary="跳转到导航页面" onClick={() => navigate("navigation")} />
        <ArrowPreference title="多脚手架测试" summary="跳转到多脚手架页面" onClick={() => navigate("multiScaffold")} />
      </DemoCard>
    </DemoSection>
  );
}
