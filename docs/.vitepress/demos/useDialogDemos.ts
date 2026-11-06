import { onBeforeUnmount, ref } from 'vue';

const SUBMIT_DELAY_MS = 2000;

/** 页面演示共享生命周期，每个对话框保留独立的显隐状态。 */
export function useDialogDemos() {
  const dialogVisible = ref(false);
  const dialogVisible2 = ref(false);
  const dialogVisible3 = ref(false);
  const dialogVisible4 = ref(false);
  const dialogVisible5 = ref(false);
  const dialogVisible6 = ref(false);
  const dialogVisible7 = ref(false);
  const dialogVisible8 = ref(false);
  const dialogVisible9 = ref(false);
  const dialogVisible10 = ref(false);
  const dialogVisible11 = ref(false);
  const dialogVisible12 = ref(false);
  const dialogVisible13 = ref(false);
  const dialogVisible14 = ref(false);
  const dialogVisible15 = ref(false);
  const outerDialogVisible = ref(false);
  const innerDialogVisible = ref(false);
  const confirmLoading = ref(false);
  const hasUnsavedChanges = ref(true);
  let submitTimer: ReturnType<typeof setTimeout> | undefined;

  const handleConfirm = () => {
    if (confirmLoading.value) return;
    confirmLoading.value = true;
    // 模拟异步提交；自定义底部负责在完成后关闭对话框。
    submitTimer = setTimeout(() => {
      submitTimer = undefined;
      confirmLoading.value = false;
      dialogVisible8.value = false;
    }, SUBMIT_DELAY_MS);
  };

  onBeforeUnmount(() => clearTimeout(submitTimer));

  return {
    dialogVisible,
    dialogVisible2,
    dialogVisible3,
    dialogVisible4,
    dialogVisible5,
    dialogVisible6,
    dialogVisible7,
    dialogVisible8,
    dialogVisible9,
    dialogVisible10,
    dialogVisible11,
    dialogVisible12,
    dialogVisible13,
    dialogVisible14,
    dialogVisible15,
    outerDialogVisible,
    innerDialogVisible,
    confirmLoading,
    hasUnsavedChanges,
    handleConfirm,
    handleBeforeClose: () => !hasUnsavedChanges.value,
  };
}
