<template>
  <Teleport :to="teleportTarget" :disabled="!shouldTeleport">
    <transition name="ex-loading-fade">
      <div
        v-if="visible"
        ref="loadingRef"
        :class="loadingClasses"
        :style="loadingStyles"
        role="alert"
        aria-live="polite"
        :aria-label="ariaLabel || text || t('loading.loading')"
      >
        <!-- 遮罩层 -->
        <div v-if="mask" class="ex-loading__mask" @click="handleMaskClick" />

        <!-- 加载内容 -->
        <div class="ex-loading__spinner-wrapper">
          <!-- 加载动画 -->
          <div class="ex-loading__spinner">
            <slot name="spinner">
              <!-- 默认旋转圆环 -->
              <div v-if="type === 'spinner'" class="ex-loading__spinner-circle">
                <svg viewBox="0 0 50 50">
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="31.4 31.4"
                  />
                </svg>
              </div>

              <!-- 点状加载 -->
              <div v-else-if="type === 'dots'" class="ex-loading__dots">
                <span class="ex-loading__dot" />
                <span class="ex-loading__dot" />
                <span class="ex-loading__dot" />
              </div>

              <!-- 脉冲加载 -->
              <div v-else-if="type === 'pulse'" class="ex-loading__pulse">
                <div class="ex-loading__pulse-ring" />
                <div class="ex-loading__pulse-ring" />
                <div class="ex-loading__pulse-ring" />
              </div>

              <!-- 条形加载 -->
              <div v-else-if="type === 'bars'" class="ex-loading__bars">
                <span class="ex-loading__bar" />
                <span class="ex-loading__bar" />
                <span class="ex-loading__bar" />
                <span class="ex-loading__bar" />
              </div>

              <!-- 霓虹环 -->
              <div v-else-if="type === 'neon'" class="ex-loading__neon">
                <div class="ex-loading__neon-ring" />
              </div>
            </slot>
          </div>

          <!-- 加载文本 -->
          <div v-if="text || $slots.default" class="ex-loading__text">
            <slot>{{ text }}</slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, onMounted, watch } from 'vue';
import type { ExLoadingProps, ExLoadingEmits, ExLoadingExposed } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExLoading',
});

const props = withDefaults(defineProps<ExLoadingProps>(), {
  visible: true,
  type: 'spinner',
  size: 'medium',
  fullscreen: false,
  mask: true,
  maskClosable: false,
});

const emit = defineEmits<ExLoadingEmits>();
const { t } = useI18n();

// Refs
const loadingRef = ref<HTMLDivElement>();
const targetElement = ref<HTMLElement | null>(null);

// Teleport 目标
const teleportTarget = computed(() => {
  if (props.fullscreen) {
    return 'body';
  }
  return targetElement.value || 'body';
});

const shouldTeleport = computed(() => {
  return props.fullscreen || !!targetElement.value;
});

// 处理目标元素
onMounted(() => {
  if (!props.fullscreen && props.target) {
    if (typeof props.target === 'string') {
      targetElement.value = document.querySelector(props.target);
    } else {
      targetElement.value = props.target;
    }

    // 确保目标元素有 position: relative
    if (targetElement.value && getComputedStyle(targetElement.value).position === 'static') {
      targetElement.value.style.position = 'relative';
    }
  }
});

watch(
  () => props.target,
  newTarget => {
    if (!props.fullscreen && newTarget) {
      if (typeof newTarget === 'string') {
        targetElement.value = document.querySelector(newTarget);
      } else {
        targetElement.value = newTarget;
      }

      // 确保目标元素有 position: relative
      if (targetElement.value && getComputedStyle(targetElement.value).position === 'static') {
        targetElement.value.style.position = 'relative';
      }
    }
  }
);

// 计算属性
const loadingClasses = computed(() => {
  const classes = ['ex-loading'];

  if (props.type) classes.push(`ex-loading--${props.type}`);
  if (props.size) classes.push(`ex-loading--${props.size}`);
  if (props.fullscreen) classes.push('ex-loading--fullscreen');
  if (!props.mask) classes.push('ex-loading--no-mask');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const loadingStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 方法
const handleMaskClick = () => {
  if (props.maskClosable) {
    emit('update:visible', false);
    emit('close');
  }
};

const close = () => {
  emit('update:visible', false);
  emit('close');
};

// 暴露的方法
const getElement = () => loadingRef.value || null;

defineExpose<ExLoadingExposed>({
  getElement,
  close,
});
</script>

<style scoped lang="scss" src="./ExLoading.scss"></style>
