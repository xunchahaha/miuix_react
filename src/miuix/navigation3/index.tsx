import { useMemo, type ReactNode } from "react";

export type NavEntry = {
  key: string;
  content: ReactNode;
};

export type NavDisplayTransitionEffects = {
  enter?: string;
  exit?: string;
};

export type SceneInfo = {
  key: string;
  index: number;
};

export type SceneState = {
  current: SceneInfo | null;
  scenes: SceneInfo[];
};

export type SceneDecoratorStrategyScope = {
  scene: SceneInfo;
};

export type SinglePaneSceneStrategy = {
  type: "singlePane";
};

export type DialogSceneStrategy = {
  type: "dialog";
};

export function NavDisplay({
  backStack,
  transitionEffects,
}: {
  backStack: NavEntry[];
  transitionEffects?: NavDisplayTransitionEffects;
}) {
  const current = backStack.at(-1);
  const style = useMemo(() => ({
    animationName: transitionEffects?.enter,
  }), [transitionEffects?.enter]);

  return (
    <div className="miuix-nav-display" data-stack-size={backStack.length} style={style}>
      {current?.content}
    </div>
  );
}

export function rememberNavDisplayState(backStack: NavEntry[]) {
  return {
    current: backStack.at(-1),
    size: backStack.length,
    canPop: backStack.length > 1,
  };
}
