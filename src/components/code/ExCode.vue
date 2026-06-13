<template>
  <div ref="codeRef" :class="codeClasses" :style="codeStyles" role="region" :aria-label="ariaLabel">
    <!-- 头部：文件名和操作按钮 -->
    <div v-if="filename || showLanguage || copyable" class="ex-code__header">
      <div class="ex-code__info">
        <!-- 文件名 -->
        <span v-if="filename" class="ex-code__filename">
          <template v-if="$slots.icon">
            <span class="ex-code__file-icon">
              <slot name="icon" />
            </span>
          </template>
          {{ filename }}
        </span>
        <!-- 语言标签 -->
        <span v-else-if="showLanguage && language" class="ex-code__language">
          {{ languageLabel }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="ex-code__actions">
        <slot name="actions">
          <!-- 复制按钮 -->
          <button
            v-if="copyable"
            class="ex-code__copy-btn"
            :class="{ 'ex-code__copy-btn--copied': copied }"
            :aria-label="copied ? t('code.copied') : t('code.copy')"
            @click="handleCopy"
          >
            <span class="ex-code__copy-icon">
              <ExIcon v-if="!copied" icon="file-copy-line" :size="16" aria-hidden="true" />
              <ExIcon v-else icon="check-line" :size="16" aria-hidden="true" />
            </span>
            <span class="ex-code__copy-text">
              {{ copied ? t('code.copied') : t('code.copy') }}
            </span>
          </button>
        </slot>
      </div>
    </div>

    <!-- 代码内容区域 -->
    <div class="ex-code__content">
      <!-- 行号 -->
      <div v-if="lineNumbers" class="ex-code__line-numbers" aria-hidden="true">
        <span
          v-for="line in totalLines"
          :key="line"
          class="ex-code__line-number"
          :class="{ 'ex-code__line-number--highlighted': isLineHighlighted(line) }"
        >
          {{ startLine + line - 1 }}
        </span>
      </div>

      <!-- 代码块 -->
      <pre class="ex-code__pre" :class="{ 'ex-code__pre--wrap': wrap }"><code
        class="ex-code__code"
        :class="`language-${language}`"
      >{{ displayCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch } from 'vue';
import type { ExCodeProps, ExCodeEmits, ExCodeExposed } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExCode',
});

const props = withDefaults(defineProps<ExCodeProps>(), {
  code: '',
  language: 'plaintext',
  theme: 'neon',
  lineNumbers: false,
  startLine: 1,
  copyable: true,
  showLanguage: true,
  wrap: false,
  readonly: false,
  editable: false,
});

const emit = defineEmits<ExCodeEmits>();

const { t } = useI18n();

const codeRef = ref<HTMLDivElement>();
const copied = ref(false);
const internalCode = ref(props.code);

// 监听外部代码变化
watch(
  () => props.code,
  newCode => {
    internalCode.value = newCode;
  }
);

// 计算属性
const codeClasses = computed(() => {
  const classes = [
    'ex-code',
    `ex-code--theme-${props.theme}`,
    `ex-code--language-${props.language}`,
  ];

  if (props.lineNumbers) classes.push('ex-code--line-numbers');
  if (props.wrap) classes.push('ex-code--wrap');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const codeStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.maxHeight) {
    styles.maxHeight =
      typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
  }

  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    } else {
      Object.assign(styles, props.style);
    }
  }

  return styles;
});

const displayCode = computed(() => {
  return internalCode.value || props.code;
});

const totalLines = computed(() => {
  return displayCode.value.split('\n').length;
});

const highlightedLines = computed(() => {
  if (!props.highlightLines) return new Set<number>();

  if (Array.isArray(props.highlightLines)) {
    return new Set(props.highlightLines);
  }

  // 解析字符串格式：'1,3-5,7' => [1, 3, 4, 5, 7]
  const lines = new Set<number>();
  const parts = props.highlightLines.split(',');

  parts.forEach(part => {
    const range = part.trim().split('-');
    if (range.length === 1 && range[0]) {
      lines.add(parseInt(range[0], 10));
    } else if (range.length === 2 && range[0] && range[1]) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      for (let i = start; i <= end; i++) {
        lines.add(i);
      }
    }
  });

  return lines;
});

const languageLabel = computed(() => {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    vue: 'Vue',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    bash: 'Bash',
    shell: 'Shell',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    sql: 'SQL',
    markdown: 'Markdown',
    yaml: 'YAML',
    xml: 'XML',
    plaintext: 'Plain Text',
  };

  return labels[props.language] || props.language.toUpperCase();
});

const ariaLabel = computed(() => {
  return `${languageLabel.value} code block`;
});

// 判断行是否高亮
const isLineHighlighted = (line: number) => {
  const actualLine = props.startLine + line - 1;
  return highlightedLines.value.has(actualLine);
};

// 事件处理
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(displayCode.value);
    copied.value = true;
    emit('copy', displayCode.value);

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to copy code:', error);
    }
  }
};

// 移除可编辑功能

// 暴露的方法
const getCode = () => {
  return displayCode.value;
};

const copy = async () => {
  await handleCopy();
};

const getElement = () => {
  return codeRef.value || null;
};

defineExpose<ExCodeExposed>({
  getCode,
  copy,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCode.scss"></style>
