export type RuntimeShaderHandle = {
  shaderString: string;
  supported: boolean;
};

export function isRuntimeShaderSupported() {
  return typeof CSS !== "undefined" && (
    CSS.supports("backdrop-filter", "blur(1px)") ||
    CSS.supports("filter", "blur(1px)")
  );
}

export function RuntimeShader(shaderString: string): RuntimeShaderHandle {
  return {
    shaderString,
    supported: isRuntimeShaderSupported(),
  };
}

export function RenderEffect(shader: RuntimeShaderHandle) {
  return {
    shader,
    cssFilter: shader.supported ? "blur(0px)" : "none",
  };
}
