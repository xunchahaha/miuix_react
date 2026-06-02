// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { RangeSliderPreference, SliderPreference, Text, VerticalSlider } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

export function SliderSection() {
  return (
    <>
      <DemoSection title="滑块">
        <DemoCard>
          <NormalSlider />
          <StepsSlider />
          <KeyPointsSlider />
          <CustomKeyPointsSlider />
          <SliderPreference title="禁用" valueText="70%" value={0.7} onValueChange={() => undefined} enabled={false} />
        </DemoCard>
      </DemoSection>

      <DemoSection title="区间滑块">
        <DemoCard>
          <RangeNormal />
          <RangeKeyPoints />
          <RangeCustom />
          <RangeSliderPreference title="禁用" valueText="30% - 70%" value={[0.3, 0.7]} onValueChange={() => undefined} enabled={false} />
        </DemoCard>
      </DemoSection>

      <DemoSection title="垂直滑块">
        <DemoCard inset>
          <div className="demo-vertical-slider-row">
            <VerticalSliderDemo label="普通" initial={0.3} />
            <VerticalSliderDemo label="步进" initial={5} min={0} max={6} steps={5} suffix="/6" />
            <VerticalSliderDemo label="关键点" initial={5} min={0} max={6} steps={5} suffix="/6" showKeyPoints />
            <VerticalSliderDemo label="自定义" initial={50} min={0} max={100} keyPoints={[0, 25, 50, 75, 100]} suffix="%" showKeyPoints />
            <VerticalSliderDemo label="禁用" initial={0.7} enabled={false} />
          </div>
        </DemoCard>
      </DemoSection>
    </>
  );
}

function NormalSlider() {
  const [value, setValue] = useState(0.3);
  return <SliderPreference title="普通" valueText={`${Math.round(value * 100)}%`} value={value} onValueChange={setValue} />;
}

function StepsSlider() {
  const [value, setValue] = useState(100);
  return (
    <SliderPreference
      title="步进"
      valueText={`${Math.round(value)}/200`}
      value={value}
      onValueChange={setValue}
      min={0}
      max={200}
      steps={199}
    />
  );
}

function KeyPointsSlider() {
  const [value, setValue] = useState(5);
  return (
    <SliderPreference
      title="带关键点的步进"
      valueText={`${Math.round(value)}/8`}
      value={value}
      onValueChange={setValue}
      min={0}
      max={8}
      steps={7}
      showKeyPoints
    />
  );
}

function CustomKeyPointsSlider() {
  const [value, setValue] = useState(25);
  return (
    <SliderPreference
      title="自定义关键点"
      valueText={`${Math.round(value)}%`}
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      keyPoints={[0, 25, 50, 75, 100]}
      showKeyPoints
    />
  );
}

function RangeNormal() {
  const [value, setValue] = useState<[number, number]>([0.2, 0.8]);
  return <RangeSliderPreference title="区间" valueText={`${Math.round(value[0] * 100)}% - ${Math.round(value[1] * 100)}%`} value={value} onValueChange={setValue} />;
}

function RangeKeyPoints() {
  const [value, setValue] = useState<[number, number]>([2, 8]);
  return (
    <RangeSliderPreference
      title="带关键点的区间"
      valueText={`${Math.round(value[0])} - ${Math.round(value[1])}`}
      value={value}
      onValueChange={setValue}
      min={0}
      max={8}
      steps={7}
      showKeyPoints
    />
  );
}

function RangeCustom() {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return (
    <RangeSliderPreference
      title="自定义区间点"
      valueText={`${Math.round(value[0])}% - ${Math.round(value[1])}%`}
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      keyPoints={[0, 20, 40, 60, 80, 100]}
      showKeyPoints
    />
  );
}

function VerticalSliderDemo({
  label,
  initial,
  min = 0,
  max = 1,
  steps,
  keyPoints,
  suffix,
  enabled = true,
  showKeyPoints = false,
}: {
  label: string;
  initial: number;
  min?: number;
  max?: number;
  steps?: number;
  keyPoints?: number[];
  suffix?: string;
  enabled?: boolean;
  showKeyPoints?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const display = suffix ? `${Math.round(value)}${suffix}` : `${Math.round(value * 100)}%`;
  return (
    <div className="demo-vertical-slider">
      <VerticalSlider
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        steps={steps}
        keyPoints={keyPoints}
        enabled={enabled}
        showKeyPoints={showKeyPoints}
      />
      <Text variant="footnote2" className="demo-vertical-slider__label">{label}<br />{display}</Text>
    </div>
  );
}
