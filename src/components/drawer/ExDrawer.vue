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
        @after-enter="handleAfterEnter"
        @after-leave="handleAfterLeave"
      >
        <div
          v-if="visible"
          ref="panelRef"
          :class="drawerClasses"
          :style="drawerStyles"
          role="dialog"
          :aria-modal="mask"
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
              <ExIcon
                icon="close-line"
                class="ex-drawer__close-icon"
                aria-hidden="true"
              />
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
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch } from 'vue';
import type { ExDrawerProps, ExDrawerEmits, ExDrawerExposed } from './types';
import { useLocale } from '../../locale';
import { useOverlay } from '../../composables/useOverlay';
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
const panelRef = ref<HTMLDivElement>();
const visible = ref(props.modelValue);
const wrapperVisible = ref(props.modelValue);

// 计算属性
const drawerClasses = computed(() => {
  const classes = ['ex-drawer', `ex-drawer--${props.placement}`];

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

  const size =
    typeof props.size === 'string' && sizeMap[props.size]
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
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.customStyle}`;
    } else {
      Object.assign(styles, props.customStyle);
    }
  }

  return styles;
});

// 浮层通用机制：滚动锁定（带滚动条补偿与引用计数）、自动聚焦、焦点陷阱、
// Esc 关闭（只关最顶层）、关闭后归还焦点、卸载清理
// （与 ExModal / ExDialog 共用同一套 useOverlay 实现）
useOverlay({
  active: () => visible.value,
  container: panelRef,
  lockScroll: () => props.lockScroll,
  closeOnEscape: () => props.closable,
  onEscape: () => requestClose(),
  restoreFocus: true,
});

// 执行打开（beforeOpen 守卫通过后置 visible，副作用由 useOverlay 处理）
const openDrawer = async () => {
  if (props.beforeOpen) {
    const result = await props.beforeOpen();
    if (result === false) {
      // 拒绝打开时回写 modelValue，保持与父级同步
      emit('update:modelValue', false);
      return;
    }
  }

  wrapperVisible.value = true;
  visible.value = true;
  emit('open');
};

// 执行关闭（守卫已在 requestClose 中执行；副作用由 useOverlay 处理）
const closeDrawer = () => {
  if (!visible.value) return;
  visible.value = false;
  emit('close');
};

// 请求关闭抽屉（关闭按钮 / 遮罩 / Esc / 取消按钮统一入口）
// beforeClose 守卫只在「请求关闭」时执行，避免 modelValue 与内部 visible 脱钩
const requestClose = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (result === false) return;
  }
  emit('update:modelValue', false);
};

const handleMaskClick = () => {
  if (props.maskClosable) {
    requestClose();
  }
};

const handleClose = () => {
  requestClose();
};

const handleOk = () => {
  emit('ok');
};

const handleCancel = () => {
  emit('cancel');
  requestClose();
};

const handleAfterEnter = () => {
  emit('opened');
};

const handleAfterLeave = () => {
  // 动画结束后移除 wrapper
  wrapperVisible.value = false;
  emit('closed');
};

// 监听 modelValue 变化：父级状态是唯一事实来源
watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      void openDrawer();
    } else {
      closeDrawer();
    }
  },
  { immediate: true }
);

// 暴露的方法
const open = () => {
  emit('update:modelValue', true);
};

const close = () => {
  requestClose();
};

const getElement = () => drawerRef.value || null;

defineExpose<ExDrawerExposed>({
  open,
  close,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExDrawer.scss"></style>
