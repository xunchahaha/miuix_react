// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from "react";
import { cx, SearchBar, Text, TopAppBar } from "../../miuix";
import {
  OFFICIAL_ICON_NAMES,
  OfficialIcon,
  type MiuixIconWeight,
  type OfficialIconName,
} from "../../miuix/official-icons";
import { Collapsible } from "../Collapsible";

const WEIGHTS: MiuixIconWeight[] = ["Light", "Normal", "Regular", "Medium", "Demibold"];

export function IconPage() {
  const [query, setQuery] = useState("");
  const [openName, setOpenName] = useState<OfficialIconName | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? OFFICIAL_ICON_NAMES.filter((name) => name.toLowerCase().includes(q)) : OFFICIAL_ICON_NAMES;
  }, [query]);

  return (
    <div className="demo-page">
      <TopAppBar className="demo-page-topbar" small title="图标" />
      <section className="demo-section">
        <div className="demo-icon-search">
          <SearchBar value={query} onValueChange={setQuery} placeholder="搜索图标" />
        </div>
        <div className="demo-icon-list">
          <div className="demo-icon-list__header">
            <Text variant="footnote1" className="demo-icon-list__header-name">名称</Text>
            <Text variant="footnote2">点按对比字重</Text>
          </div>
          {filtered.map((name) => {
            const open = openName === name;
            return (
              <div
                className={cx("demo-icon-row", open && "demo-icon-row--open")}
                key={name}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => setOpenName(open ? null : name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenName(open ? null : name);
                  }
                }}
              >
                <div className="demo-icon-row__head">
                  <span className="demo-icon-row__name">{name}</span>
                  <OfficialIcon className="demo-icon-row__glyph" name={name} size={24} />
                  <OfficialIcon
                    className="demo-icon-row__chevron"
                    name={open ? "ExpandLess" : "ExpandMore"}
                    size={18}
                  />
                </div>
                <Collapsible open={open}>
                  <div className="demo-icon-weights">
                    {WEIGHTS.map((weight) => (
                      <div className="demo-icon-weight" key={weight}>
                        <OfficialIcon name={name} weight={weight} size={28} />
                        <Text variant="footnote2">{weight}</Text>
                      </div>
                    ))}
                  </div>
                </Collapsible>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="demo-icon-empty">
              <Text variant="body2">未找到匹配的图标</Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
