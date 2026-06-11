<template>
  <Teleport to="body">
    <div
      v-if="wrapperVisible"
      ref="drawerRef"
      class="ex-drawer-wrapper"
      :style="wrapperStyle"
      v-bind="$attrs"
    >
      <!-- 遮罩层 -->
      <Transition name="ex-drawer-mask-fade">
        <div
          v-if="visible && mask"
          class="ex-drawer-mask"
          @click="handleMaskClick"
        />
      </Transition>

      <!-- 抽屉容器 -->
      <Transition
        :name="`ex-drawer-slide-${placement}`"
        @after-leave="handleAfterLeave"
      >
        <div
          v-if="visible"
          :class="drawerClasses"
          :style="drawerStyles"
          role="dialog"
          :aria-modal="true"
          :aria-label="ariaLabel || title"
          @click.stop
        >
          <!-- 霓虹边框效果 -->
          <div class="ex-drawer__border" />

          <!-- 头部 -->
          <div
            v-if="$slots.header || title || closable"
            class="ex-drawer__header"
          >
            <slot name="header">
              <div class="ex-drawer__title">
                <slot name="title">
                  {{ title }}
                </slot>
              </div>
            </slot>

            <!-- 关闭按钮 -->
            <button
              v-if="closable"
              class="ex-drawer__close"
              type="button"
              :aria-label="t('close')"
              @click="handleClose"
            >
              <img
                src="https://api.iconify.design/ri/close-line.svg"
                alt="关闭"
                class="ex-drawer__close-icon"
              >
            </button>
          </div>

          <!-- 内容 -->
          <div class="ex-drawer__body">
            <slot v-if="!destroyOnClose || visible" />
          </div>

          <!-- 底部 -->
          <div
            v-if="$slots.footer || showFooter"
            class="ex-drawer__footer"
          >
            <slot name="footer">
              <ExButton
                :disabled="cancelDisabled"
                @click="handleCancel"
              >
                {{ cancelText || t('cancel') }}
              </ExButton>
              <ExButton
                :type="okType"
                :loading="okLoading"
                :disabled="okDisabled"
                @click="handleOk"
              >
                {{ okText || t('ok') }}
              </ExButton>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { ExDrawerProps, ExDrawerEmits, ExDrawerExposed } from './types';
import { useLocale } from '../../locale';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExDrawer',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExDrawerProps>(), {
  modelValue: false,
  placement: 'right',
  size: 'medium',
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: false,
  showFooter: false,
  okType: 'primary',
  okLoading: false,
  okDisabled: false,
  cancelDisabled: false,
  zIndex: 1000,
  lockScroll: true,
});

const emit = defineEmits<ExDrawerEmits>();

const { t } = useLocale('drawer');
const drawerRef = ref<HTMLDivElement>();
const visible = ref(props.modelValue);
const wrapperVisible = ref(props.modelValue);
const originalOverflow = ref('');

// 计算属性
const drawerClasses = computed(() => {
  const classes = [
    'ex-drawer',
    `ex-drawer--${props.placement}`,
  ];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {};
  
  // 如果用户指定了 zIndex，直接使用该值；否则使用 CSS 变量表达式
  if (props.zIndex !== undefined) {
    style.zIndex = String(props.zIndex);
  } else {
    style.zIndex = 'calc(var(--ex-z-overlay) - 1000 + var(--ex-z-index-base, 1000))';
  }
  
  return style;
});

const drawerStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 尺寸处理
  const sizeMap: Record<string, string> = {
    small: '300px',
    medium: '500px',
    large: '800px',
  };

  const size = typeof props.size === 'string' && sizeMap[props.size]
    ? sizeMap[props.size]
    : typeof props.size === 'number'
      ? `${props.size}px`
      : props.size;

  // 根据位置设置宽度或高度
  if (size) {
    if (props.placement === 'left' || props.placement === 'right') {
      styles.width = size;
    } else {
      styles.height = size;
    }
  }

  // 自定义样式
  if (props.customStyle) {
    if (typeof props.customStyle === 'string') {
      return `${Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')}; ${props.customStyle}`;
    } else {
      Object.assign(styles, props.customStyle);
    }
  }

  return styles;
});

// 方法
const lockBodyScroll = () => {
  if (!props.lockScroll) return;
  originalOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
};

const unlockBodyScroll = () => {
  if (!props.lockScroll) return;
  document.body.style.overflow = originalOverflow.value;
};

const handleOpen = async () => {
  if (props.beforeOpen) {
    const result = await props.beforeOpen();
    if (!result) return;
  }

  wrapperVisible.value = true;
  await nextTick();
  visible.value = true;
  emit('update:modelValue', true);
  emit('open');

  await nextTick();
  lockBodyScroll();
  emit('opened');
};

const handleClose = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (!result) return;
  }

  visible.value = false;
  emit('update:modelValue', false);
  emit('close');
};

const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose();
  }
};

const handleOk = () => {
  emit('ok');
};

const handleCancel = () => {
  emit('cancel');
  handleClose();
};

const handleAfterLeave = () => {
  // 动画结束后移除 wrapper
  wrapperVisible.value = false;
  unlockBodyScroll();
  emit('closed');
};

const open = () => {
  handleOpen();
};

const close = () => {
  handleClose();
};

const getElement = () => drawerRef.value || null;

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== visible.value) {
    if (newVal) {
      handleOpen();
    } else {
      handleClose();
    }
  }
});

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value && props.closable) {
    handleClose();
  }
};

// 生命周期
onMounted(() => {
  if (props.modelValue) {
    handleOpen();
  }
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  unlockBodyScroll();
  document.removeEventListener('keydown', handleKeydown);
});

defineExpose<ExDrawerExposed>({
  open,
  close,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExDrawer.scss"></style>
