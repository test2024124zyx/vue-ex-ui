<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyleList"
    role="group"
    :aria-label="rootAriaLabel"
  >
    <!-- 头部：文件名 / 语言标签 / 操作按钮 -->
    <div
      v-if="hasHeader"
      class="ex-code__header"
    >
      <div class="ex-code__info">
        <span
          v-if="filename"
          class="ex-code__filename"
        >
          <span
            v-if="$slots.icon"
            class="ex-code__file-icon"
          >
            <slot name="icon" />
          </span>
          {{ filename }}
        </span>
        <span
          v-else-if="showLanguage"
          class="ex-code__language"
        >
          {{ languageLabel }}
        </span>
      </div>

      <div class="ex-code__actions">
        <slot name="actions">
          <button
            v-if="copyable"
            type="button"
            class="ex-code__copy-btn"
            :class="{ 'ex-code__copy-btn--copied': copied }"
            :aria-label="copyAriaLabel"
            :title="copyAriaLabel"
            @click="handleCopy"
          >
            <span class="ex-code__copy-icon">
              <ExIcon
                :icon="copied ? 'check-line' : 'file-copy-line'"
                :size="16"
                aria-hidden="true"
              />
            </span>
            <span class="ex-code__copy-text">
              {{ copied ? t('code.copied') : t('code.copy') }}
            </span>
          </button>
        </slot>
      </div>
    </div>

    <!-- 内容区：逐行渲染（行号 / 行高亮 / 换行对齐统一在同一栅格内） -->
    <div
      class="ex-code__content"
      :style="contentStyles"
    >
      <div class="ex-code__lines">
        <div
          v-for="(line, index) in renderLines"
          :key="index"
          class="ex-code__line"
          :class="{ 'ex-code__line--highlighted': isLineHighlighted(index) }"
        >
          <span
            v-if="lineNumbers"
            class="ex-code__gutter"
            aria-hidden="true"
          >{{ startLine + index }}</span><span class="ex-code__line-content"><template
            v-for="(token, ti) in line"
            :key="ti"
          ><span
            v-if="token.type !== 'plain'"
            :class="'ex-token-' + token.type"
          >{{ token.value }}</span><template v-else>{{ token.value }}</template></template></span>
        </div>

        <!-- 可编辑：透明 textarea 叠加在高亮层之上，光标可见、文字由下方高亮层呈现 -->
        <textarea
          v-if="editable"
          ref="textareaRef"
          class="ex-code__textarea"
          :value="currentCode"
          :readonly="readonly"
          :aria-label="editorAriaLabel"
          wrap="soft"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          @input="handleInput"
          @keydown="handleKeydown"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { ExCodeProps, ExCodeEmits, ExCodeExposed } from './types';
import { useI18n } from '../../locale';
import { tokenizeToLines } from './highlighter';

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
  tabSize: 2,
});

const emit = defineEmits<ExCodeEmits>();

const { t } = useI18n();

const rootRef = ref<HTMLDivElement>();
const textareaRef = ref<HTMLTextAreaElement>();
const copied = ref(false);

// 内部维护当前代码，支持受控（:code）与双向（v-model:code）。
const currentCode = ref(props.code);
watch(
  () => props.code,
  val => {
    if (val !== currentCode.value) currentCode.value = val;
  }
);

// 同步高亮：纯函数、零依赖、无异步加载，逐字符即时高亮，编辑不卡顿。
const renderLines = computed(() => tokenizeToLines(currentCode.value, props.language));

const rootClasses = computed(() => {
  const classes = [
    'ex-code',
    `ex-code--theme-${props.theme}`,
    `ex-code--language-${props.language}`,
  ];

  if (props.lineNumbers) classes.push('ex-code--line-numbers');
  if (props.wrap) classes.push('ex-code--wrap');
  if (props.editable) classes.push('ex-code--editable');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

// 行号栏宽度由「最大行号位数」决定（等宽字体下 1ch 恰为一位数字宽）。
// 必须落在根元素上：--ex-code-gutter-width 的 calc 在根层求值。
const gutterChars = computed(() => {
  const maxLine = props.startLine + renderLines.value.length - 1;
  return Math.max(2, String(maxLine).length);
});

const rootStyleList = computed(() => [
  { '--ex-code-gutter-chars': String(gutterChars.value) },
  props.style ?? '',
]);

const contentStyles = computed<Record<string, string>>(() => {
  if (props.maxHeight === undefined) return {};
  return {
    maxHeight:
      typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
  };
});

const highlightedLines = computed(() => {
  if (!props.highlightLines) return new Set<number>();

  if (Array.isArray(props.highlightLines)) {
    return new Set(props.highlightLines);
  }

  // 解析字符串格式：'1,3-5,7' => {1, 3, 4, 5, 7}
  const lines = new Set<number>();
  props.highlightLines.split(',').forEach(part => {
    const range = part.trim().split('-');
    if (range.length === 1 && range[0]) {
      lines.add(parseInt(range[0], 10));
    } else if (range.length === 2 && range[0] && range[1]) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      for (let i = start; i <= end; i++) lines.add(i);
    }
  });

  return lines;
});

// index 为 0 基行下标；展示行号与高亮判定都基于 startLine + index。
const isLineHighlighted = (index: number) => highlightedLines.value.has(props.startLine + index);

const LANGUAGE_LABELS: Record<string, string> = {
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

const languageLabel = computed(
  () => LANGUAGE_LABELS[props.language] || props.language.toUpperCase()
);

const hasHeader = computed(() => Boolean(props.filename) || props.showLanguage || props.copyable);

const rootAriaLabel = computed(() => `${languageLabel.value} ${t('code.codeBlock')}`);
const editorAriaLabel = computed(() => t('code.editor'));
const copyAriaLabel = computed(() => (copied.value ? t('code.copied') : t('code.copy')));

// 编辑输入：更新内部代码并派发事件（高亮随 computed 同步刷新）。
const emitChange = (val: string) => {
  currentCode.value = val;
  emit('update:code', val);
  emit('change', val);
};

const handleInput = (event: Event) => {
  emitChange((event.target as HTMLTextAreaElement).value);
};

// 在受控 textarea 上替换内容并恢复光标 / 选区（需等 DOM 同步后再设置）。
const applyEditorChange = (next: string, selStart: number, selEnd: number) => {
  emitChange(next);
  nextTick(() => {
    const ta = textareaRef.value;
    if (!ta) return;
    ta.selectionStart = selStart;
    ta.selectionEnd = selEnd;
  });
};

// 编辑增强：Tab 缩进 / Shift+Tab 反缩进，支持多行选区按行处理。
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || props.readonly) return;
  event.preventDefault();

  const ta = event.target as HTMLTextAreaElement;
  const value = currentCode.value;
  const selStart = ta.selectionStart;
  const selEnd = ta.selectionEnd;
  const indent = ' '.repeat(Math.max(1, props.tabSize));

  const selection = value.slice(selStart, selEnd);
  const multiline = selection.includes('\n');

  // 单光标且无跨行：直接在光标处插入缩进。
  if (!event.shiftKey && !multiline) {
    const next = value.slice(0, selStart) + indent + value.slice(selEnd);
    const caret = selStart + indent.length;
    applyEditorChange(next, caret, caret);
    return;
  }

  // 跨行 / Shift+Tab：对选区覆盖的每一行整体缩进或反缩进。
  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
  const region = value.slice(lineStart, selEnd);
  const lines = region.split('\n');

  let firstDelta = 0;
  let totalDelta = 0;
  const newLines = lines.map(line => {
    if (event.shiftKey) {
      const removed = line.match(/^[ \t]{1,2}/);
      const removeLen = removed
        ? line.startsWith('\t')
          ? 1
          : Math.min(indent.length, line.match(/^ +/)?.[0].length ?? 0)
        : 0;
      if (totalDelta === 0 && firstDelta === 0) firstDelta = -removeLen;
      totalDelta -= removeLen;
      return line.slice(removeLen);
    }
    if (firstDelta === 0 && totalDelta === 0) firstDelta = indent.length;
    totalDelta += indent.length;
    return indent + line;
  });

  const next = value.slice(0, lineStart) + newLines.join('\n') + value.slice(selEnd);
  applyEditorChange(next, Math.max(lineStart, selStart + firstDelta), selEnd + totalDelta);
};

// 复制提示定时器（卸载时清理，防止悬挂 / 叠加）。
let copyTimer: ReturnType<typeof setTimeout> | null = null;

// 降级复制：navigator.clipboard 不可用（非安全上下文 / 旧浏览器）时回退到 execCommand。
const fallbackCopy = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const handleCopy = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentCode.value);
    } else {
      fallbackCopy(currentCode.value);
    }
    copied.value = true;
    emit('copy', currentCode.value);

    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
      copyTimer = null;
    }, 2000);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to copy code:', error);
    }
  }
};

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
});

// 暴露的方法
const getCode = () => currentCode.value;
const copy = async () => {
  await handleCopy();
};
const getElement = () => rootRef.value || null;

defineExpose<ExCodeExposed>({
  getCode,
  copy,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCode.scss"></style>
