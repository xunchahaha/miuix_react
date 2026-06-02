// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { Fragment } from "react";
import { HorizontalDivider, Text, TopAppBar, useMiuixTheme, type MiuixTextStyles } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

const SAMPLE_CN = "天地玄黄 宇宙洪荒";
const SAMPLE_EN = "The Quick Brown Fox Jumps";
const SAMPLE_NUM = "0123456789 !@#$%&";

type Entry = { name: keyof MiuixTextStyles; description: string };

const groups: Array<{ title: string; entries: Entry[] }> = [
  {
    title: "标题样式",
    entries: [
      { name: "title1", description: "32sp" },
      { name: "title2", description: "24sp" },
      { name: "title3", description: "20sp" },
      { name: "title4", description: "18sp" },
    ],
  },
  {
    title: "大标题样式",
    entries: [
      { name: "headline1", description: "17sp" },
      { name: "headline2", description: "16sp" },
    ],
  },
  {
    title: "正文样式",
    entries: [
      { name: "subtitle", description: "14sp / 加粗" },
      { name: "main", description: "17sp" },
      { name: "paragraph", description: "17sp / 行高 1.2em" },
      { name: "body1", description: "16sp" },
      { name: "body2", description: "14sp" },
      { name: "button", description: "17sp" },
    ],
  },
  {
    title: "脚注样式",
    entries: [
      { name: "footnote1", description: "13sp" },
      { name: "footnote2", description: "11sp" },
    ],
  },
];

function TextStyleItem({ name, description }: Entry) {
  const theme = useMiuixTheme();
  const style = theme.textStyles[name];
  return (
    <div className="demo-textstyle-item">
      <div className="demo-textstyle-head">
        <Text variant="footnote1">{name}</Text>
        <Text variant="footnote2" className="demo-color-space">{description}</Text>
      </div>
      <div style={style}>{SAMPLE_CN}</div>
      <div style={style}>{SAMPLE_EN}</div>
      <div style={style} className="demo-color-space">{SAMPLE_NUM}</div>
    </div>
  );
}

export function TextStylePage() {
  return (
    <div className="demo-page">
      <TopAppBar className="demo-page-topbar" small title="文本样式" />
      {groups.map((group) => (
        <DemoSection key={group.title} title={group.title}>
          <DemoCard inset>
            {group.entries.map((entry, index) => (
              <Fragment key={entry.name}>
                {index > 0 && <HorizontalDivider />}
                <TextStyleItem {...entry} />
              </Fragment>
            ))}
          </DemoCard>
        </DemoSection>
      ))}
      <DemoSection title="全部样式总览">
        <DemoCard inset>
          {groups.flatMap((group) => group.entries).map((entry, index) => (
            <Fragment key={entry.name}>
              {index > 0 && <HorizontalDivider />}
              <TextStyleItem {...entry} />
            </Fragment>
          ))}
        </DemoCard>
      </DemoSection>
    </div>
  );
}
