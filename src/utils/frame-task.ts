/** 将同一帧内的多次更新合并，并允许撤销尚未执行的任务。 */
export function createFrameTask(update: () => void) {
  let frame: number | undefined;
  return {
    schedule() {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        update();
      });
    },
    cancel() {
      if (frame === undefined) return;
      cancelAnimationFrame(frame);
      frame = undefined;
    },
  };
}
