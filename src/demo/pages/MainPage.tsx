// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from "react";
import {
  BasicComponent,
  OverlayIconCascadingDropdownMenu,
  OverlayIconDropdownMenu,
  SearchBar,
  SmallTitle,
  TopAppBar,
  type DropdownDemoEntry,
} from "../../miuix";
import { OfficialIcon } from "../../miuix/official-icons";
import { ArrowSection } from "../sections/ArrowSection";
import { BasicSection } from "../sections/BasicSection";
import { BlurSection } from "../sections/BlurSection";
import { BottomSheetSection } from "../sections/BottomSheetSection";
import { ButtonSection } from "../sections/ButtonSection";
import { CardSection } from "../sections/CardSection";
import { CheckboxSection } from "../sections/CheckboxSection";
import { ColorPickerSection } from "../sections/ColorPickerSection";
import { DialogSection } from "../sections/DialogSection";
import { DropdownSection } from "../sections/DropdownSection";
import { NumberPickerSection } from "../sections/NumberPickerSection";
import { OtherSection } from "../sections/OtherSection";
import { ProgressIndicatorSection } from "../sections/ProgressIndicatorSection";
import { RadioButtonSection } from "../sections/RadioButtonSection";
import { SliderSection } from "../sections/SliderSection";
import { SnackbarSection } from "../sections/SnackbarSection";
import { SpinnerSection } from "../sections/SpinnerSection";
import { SwitchSection } from "../sections/SwitchSection";
import { TabRowSection } from "../sections/TabRowSection";
import { TextFieldSection } from "../sections/TextFieldSection";

export function MainPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex1, setSelectedIndex1] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [selectedIndex3, setSelectedIndex3] = useState(0);
  const [cascadingSortIndex, setCascadingSortIndex] = useState(0);
  const [cascadingViewIndex, setCascadingViewIndex] = useState(0);
  const [cascadingFilterIndex, setCascadingFilterIndex] = useState(0);
  const [multiSelected, setMultiSelected] = useState(() => new Set(["多选 B-2", "多选 B-3"]));

  const toggleMulti = useCallback((label: string) => {
    setMultiSelected((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const optionItems = useMemo<DropdownDemoEntry[]>(
    () => [
      {
        items: ["选择 A-1", "选择 A-2"].map((text, index) => ({
          text,
          selected: selectedIndex1 === index,
          onClick: () => setSelectedIndex1(index),
        })),
      },
      {
        items: ["选择 B-1", "选择 B-2", "选择 B-3"].map((text, index) => ({
          text,
          selected: selectedIndex2 === index,
          onClick: () => setSelectedIndex2(index),
        })),
      },
      {
        items: ["选择 C-1", "选择 C-2", "选择 C-3", "选择 C-4"].map((text, index) => ({
          text,
          selected: selectedIndex3 === index,
          onClick: () => setSelectedIndex3(index),
        })),
      },
    ],
    [selectedIndex1, selectedIndex2, selectedIndex3],
  );

  const cascadingEntries = useMemo<DropdownDemoEntry[]>(
    () => [
      {
        items: ["按拍摄日期排序", "按添加日期排序"].map((text, index) => ({
          text,
          selected: cascadingSortIndex === index,
          onClick: () => setCascadingSortIndex(index),
        })),
      },
      {
        items: [
          {
            text: "视图模式",
            children: ["按日期分组", "紧凑模式"].map((text, index) => ({
              text,
              selected: cascadingViewIndex === index,
              onClick: () => setCascadingViewIndex(index),
            })),
          },
          {
            text: "筛选",
            children: ["全部项目", "相机相册"].map((text, index) => ({
              text,
              selected: cascadingFilterIndex === index,
              onClick: () => setCascadingFilterIndex(index),
            })),
          },
        ],
      },
    ],
    [cascadingFilterIndex, cascadingSortIndex, cascadingViewIndex],
  );

  const multiSelectItems = useMemo<DropdownDemoEntry[]>(
    () => [
      {
        items: ["多选 A-1", "多选 A-2"].map((text) => ({
          text,
          selected: multiSelected.has(text),
          onClick: () => toggleMulti(text),
        })),
      },
      {
        items: ["多选 B-1", "多选 B-2", "多选 B-3"].map((text) => ({
          text,
          selected: multiSelected.has(text),
          onClick: () => toggleMulti(text),
        })),
      },
    ],
    [multiSelected, toggleMulti],
  );

  return (
    <div className="demo-page">
      <TopAppBar
        className="demo-page-topbar"
        small
        title="首页"
        actions={
          <>
            <OverlayIconCascadingDropdownMenu entries={cascadingEntries} collapseOnSelection label="调节">
              <OfficialIcon className="miuix-icon" name="Tune" size={24} />
            </OverlayIconCascadingDropdownMenu>
            <OverlayIconDropdownMenu entries={optionItems} collapseOnSelection={false} label="排序">
              <OfficialIcon className="miuix-icon" name="Sort" size={24} />
            </OverlayIconDropdownMenu>
            <OverlayIconDropdownMenu entries={multiSelectItems} collapseOnSelection={false} label="全选">
              <OfficialIcon className="miuix-icon" name="SelectAll" size={24} />
            </OverlayIconDropdownMenu>
          </>
        }
      />
      <section className="demo-section">
        <SmallTitle>搜索栏</SmallTitle>
        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="搜索"
          expanded={expanded}
          onExpandedChange={setExpanded}
          outsideEndAction={
            <button
              type="button"
              className="demo-search-cancel"
              onClick={() => {
                setExpanded(false);
                setQuery("");
              }}
            >
              取消
            </button>
          }
        >
          <div className="demo-search-suggestions">
            {[0, 1, 2, 3].map((index) => (
              <BasicComponent
                key={index}
                title={`建议 ${index}`}
                onClick={() => {
                  setQuery(`建议 ${index}`);
                  setExpanded(false);
                }}
              />
            ))}
          </div>
        </SearchBar>
      </section>

      {!expanded && (
        <>
          <BasicSection />
          <CheckboxSection />
          <RadioButtonSection />
          <SwitchSection />
          <ArrowSection />
          <DialogSection />
          <BottomSheetSection />
          <DropdownSection />
          <SpinnerSection />
          <ButtonSection />
          <SnackbarSection />
          <ProgressIndicatorSection />
          <TextFieldSection />
          <SliderSection />
          <TabRowSection />
          <NumberPickerSection />
          <ColorPickerSection />
          <CardSection />
          <BlurSection />
          <OtherSection />
        </>
      )}
    </div>
  );
}
