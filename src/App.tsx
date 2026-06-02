// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from "lucide-react";
import { useState } from "react";
import {
  cx,
  FloatingActionButton,
  SnackbarProvider,
  MiuixTheme,
} from "./miuix";
import { ColorPage } from "./demo/pages/ColorPage";
import { IconPage } from "./demo/pages/IconPage";
import { MainPage } from "./demo/pages/MainPage";
import { SettingsPage } from "./demo/pages/SettingsPage";
import { TextStylePage } from "./demo/pages/TextStylePage";
import { OfficialIcon, type OfficialIconName } from "./miuix/official-icons";

const pages = [
  { key: "home", label: "首页", icon: "HorizontalSplit" },
  { key: "icon", label: "图标", icon: "Create" },
  { key: "color", label: "颜色", icon: "Image" },
  { key: "textStyle", label: "文本样式", icon: "Edit" },
  { key: "settings", label: "设置", icon: "Settings" },
] satisfies ReadonlyArray<{ key: string; label: string; icon: OfficialIconName }>;

const GITHUB_URL = "https://github.com/compose-miuix-ui/miuix";

function DemoApp() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [pageIndex, setPageIndex] = useState(0);

  const pageWidth = 100 / pages.length;

  return (
    <MiuixTheme mode={mode}>
      <SnackbarProvider>
        {/* Wide-screen shell: a left NavigationRail (sidebar) + a content pane
            that fills the rest of the viewport. Mirrors the Compose
            WideScreenContent (NavigationRail + HorizontalPager). */}
        <div className="demo-shell">
          <aside className="demo-rail">
            <nav className="demo-rail__nav">
              {pages.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  className={cx(index === pageIndex && "miuix-navigation-bar__item--selected")}
                  aria-current={index === pageIndex ? "page" : undefined}
                  onClick={() => setPageIndex(index)}
                >
                  <OfficialIcon className="miuix-icon" name={item.icon} size={28} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
          <div className="demo-main">
            {/* HorizontalPager: all pages laid side by side; switching slides the
                whole track horizontally instead of an instant swap. */}
            <div className="demo-pager">
              <div
                className="demo-pager__track"
                style={{ width: `${pages.length * 100}%`, transform: `translateX(-${pageIndex * pageWidth}%)` }}
              >
                <div className="demo-pager__page" style={{ width: `${pageWidth}%` }}>
                  <MainPage />
                </div>
                <div className="demo-pager__page" style={{ width: `${pageWidth}%` }}>
                  <IconPage />
                </div>
                <div className="demo-pager__page" style={{ width: `${pageWidth}%` }}>
                  <ColorPage />
                </div>
                <div className="demo-pager__page" style={{ width: `${pageWidth}%` }}>
                  <TextStylePage />
                </div>
                <div className="demo-pager__page" style={{ width: `${pageWidth}%` }}>
                  <SettingsPage mode={mode} onModeChange={setMode} />
                </div>
              </div>
            </div>
            <div className="demo-main__fab">
              <FloatingActionButton label="GitHub" icon={Link} onClick={() => window.open(GITHUB_URL, "_blank")} />
            </div>
          </div>
        </div>
      </SnackbarProvider>
    </MiuixTheme>
  );
}

export default DemoApp;
