// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Expand/collapse container that animates max-height + opacity, mirroring the
 * Compose `AnimatedVisibility(enter = fadeIn() + expandVertically(), exit = ...)`.
 * Keeps children mounted during the collapse animation, then unmounts.
 */
export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [maxHeight, setMaxHeight] = useState(open ? "none" : "0px");
  const [opacity, setOpacity] = useState(open ? 1 : 0);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && !mounted) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open, mounted]);

  useLayoutEffect(() => {
    if (!mounted) return undefined;
    const inner = innerRef.current;
    const height = inner ? inner.scrollHeight : 0;
    const timers: number[] = [];
    const rafs: number[] = [];

    if (open) {
      // Animate from 0 to the measured height, then release the cap to `none`
      // so dynamic content (e.g. growing summary) is not clipped.
      rafs.push(
        requestAnimationFrame(() => {
          setMaxHeight("0px");
          setOpacity(0);
          rafs.push(
            requestAnimationFrame(() => {
              setMaxHeight(`${height}px`);
              setOpacity(1);
            }),
          );
        }),
      );
      timers.push(window.setTimeout(() => setMaxHeight("none"), 300));
    } else {
      // Collapse: pin the current height, then animate to 0 and unmount.
      rafs.push(
        requestAnimationFrame(() => {
          setMaxHeight(`${height}px`);
          rafs.push(
            requestAnimationFrame(() => {
              setMaxHeight("0px");
              setOpacity(0);
            }),
          );
        }),
      );
      timers.push(window.setTimeout(() => setMounted(false), 280));
    }

    return () => {
      rafs.forEach(cancelAnimationFrame);
      timers.forEach(window.clearTimeout);
    };
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className="demo-collapsible" style={{ maxHeight, opacity }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
