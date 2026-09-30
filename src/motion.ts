// 动画降级（需求 §29）：系统「减少动态效果」开启时提供静态呈现
export const prefersReducedMotion =
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
