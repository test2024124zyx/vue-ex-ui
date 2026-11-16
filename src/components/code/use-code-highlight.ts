import { onScopeDispose, shallowRef, watch, type Ref } from 'vue';
import { MAX_HIGHLIGHT_LENGTH, tokenizeToLines, type Token } from './highlighter';
import { getGrammar } from './highlighter/grammars';

const DEFERRED_HIGHLIGHT_SIZE = 16 * 1024;
const HIGHLIGHT_IDLE_DELAY = 80;

export function useCodeHighlight(
  code: Ref<string>,
  readLanguage: () => string,
  readEditable: () => boolean
) {
  const lines = shallowRef<Token[][]>([]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  };

  watch(
    [code, readLanguage, readEditable],
    ([value, language, editable], [previous, previousLanguage]) => {
      cancel();
      const highlight = () => {
        timer = undefined;
        lines.value = tokenizeToLines(value, language, lines.value);
      };
      if (
        editable &&
        previous !== undefined &&
        language === previousLanguage &&
        value !== previous &&
        value.length >= DEFERRED_HIGHLIGHT_SIZE &&
        value.length <= MAX_HIGHLIGHT_LENGTH &&
        getGrammar(language)
      ) {
        // 文字即时回显，未变行保留颜色。停笔后由完整分词纠正跨行语法状态。
        const priorText = previous.split('\n');
        const priorLines = lines.value;
        lines.value = value.split('\n').map((line, index) => {
          const prior = priorLines[index];
          if (prior && line === priorText[index]) return prior;
          return line ? [{ type: 'plain', value: line }] : [];
        });
        timer = setTimeout(highlight, HIGHLIGHT_IDLE_DELAY);
      } else {
        highlight();
      }
    },
    { immediate: true }
  );

  onScopeDispose(cancel);
  return lines;
}
