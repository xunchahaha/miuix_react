// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { CircularProgressIndicator, InfiniteProgressIndicator, LinearProgressIndicator } from "../../miuix";
import { DemoSection } from "../section";

const progressValues: Array<number | null> = [0, 0.25, 0.5, 0.75, 1, null];

// Drives a 0..1..0 animated value to demonstrate the determinate indicators.
function useAnimatedProgress() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const tick = (time: number) => {
      if (start == null) start = time;
      const elapsed = (time - start) / 1000;
      // Triangle wave with a 2s period (1s up, 1s down).
      const t = elapsed % 2;
      setValue(t <= 1 ? t : 2 - t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return value;
}

export function ProgressIndicatorSection() {
  const animated = useAnimatedProgress();

  return (
    <DemoSection title="进度指示器">
      <div className="demo-progress-list">
        <LinearProgressIndicator progress={animated} />
        {progressValues.map((value, index) => (
          <LinearProgressIndicator key={index} progress={value} />
        ))}
      </div>
      <div className="demo-progress-circular-row">
        <CircularProgressIndicator progress={animated} />
        {progressValues.map((value, index) => (
          <CircularProgressIndicator key={index} progress={value} />
        ))}
        <InfiniteProgressIndicator />
      </div>
    </DemoSection>
  );
}
