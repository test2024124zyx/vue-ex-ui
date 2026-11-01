import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFocusTrap, scheduleAutoFocus } from '../../src/composables/overlay-manager';

const disposers: Array<() => void> = [];

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose());
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('延迟自动聚焦尊重已建立的弹层焦点', () => {
  it.each(['control', 'container', 'teleport'] as const)('保留用户提前进入 %s 的焦点', kind => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => frames.push(callback));
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const root = mountContent('<button>首项</button><button id="chosen">当前操作</button>');
    root.tabIndex = -1;
    const owned = [root];
    disposers.push(scheduleAutoFocus(root, () => owned));
    frames[0]!(0);
    // 子弹层在父层的自动聚焦任务排队之后才打开，归属集合必须实时读取。
    const popup = kind === 'teleport' ? mountContent('<button>子菜单</button>') : undefined;
    if (popup) owned.push(popup);
    const target =
      popup?.querySelector('button') ??
      (kind === 'container' ? root : root.querySelector<HTMLElement>('#chosen')!);
    target.focus();
    frames[1]!(0);
    expect(document.activeElement).toBe(target);
  });
});

function mountContent(content: string): HTMLElement {
  const root = document.createElement('section');
  root.innerHTML = content;
  document.body.append(root);
  return root;
}

function pressTab(target: HTMLElement, shiftKey = false): void {
  target.focus();
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    })
  );
}

describe('浮层遵守原生 fieldset 禁用语义', () => {
  it('双向焦点循环跳过继承禁用的输入框', () => {
    const root = mountContent(`
      <fieldset disabled><input id="disabled-field"></fieldset>
      <button id="first">首项</button><button id="last">末项</button>
    `);
    disposers.push(createFocusTrap(root));
    const first = root.querySelector<HTMLElement>('#first')!;
    const last = root.querySelector<HTMLElement>('#last')!;
    pressTab(last);
    expect(document.activeElement).toBe(first);
    pressTab(first, true);
    expect(document.activeElement).toBe(last);
  });

  it('保留首个 legend 内的可用控件，但跳过后续 legend 与嵌套 fieldset', () => {
    const root = mountContent(`
      <fieldset disabled>
        <legend><button id="legend-control">首标题操作</button></legend>
        <input id="disabled-field">
        <legend><button id="later-legend">后标题操作</button></legend>
        <fieldset><button id="nested-control">嵌套操作</button></fieldset>
      </fieldset>
      <button id="outside">外部操作</button>
    `);
    disposers.push(createFocusTrap(root));
    const legend = root.querySelector<HTMLElement>('#legend-control')!;
    const outside = root.querySelector<HTMLElement>('#outside')!;
    pressTab(outside);
    expect(document.activeElement).toBe(legend);
    pressTab(legend);
    expect(document.activeElement).toBe(outside);
    pressTab(outside, true);
    expect(document.activeElement).toBe(legend);
  });

  it('禁用状态动态改变后按新的可聚焦集合导航', () => {
    const root = mountContent(`
      <fieldset><input id="field"></fieldset>
      <button id="next">下一个可用项</button><button id="after">末项</button>
    `);
    disposers.push(createFocusTrap(root));
    const fieldset = root.querySelector('fieldset')!;
    const input = root.querySelector('input')!;
    const after = root.querySelector<HTMLElement>('#after')!;
    pressTab(after);
    expect(document.activeElement).toBe(input);
    fieldset.disabled = true;
    pressTab(after);
    expect(document.activeElement).toBe(root.querySelector('#next'));
    fieldset.disabled = false;
    pressTab(after);
    expect(document.activeElement).toBe(input);
  });

  it('fieldset 的禁用不应误伤非表单控件的链接', () => {
    const root = mountContent(`
      <fieldset disabled><input><a id="help" href="#help">帮助</a></fieldset>
      <button id="last">末项</button>
    `);
    disposers.push(createFocusTrap(root));
    const help = root.querySelector<HTMLElement>('#help')!;
    const last = root.querySelector<HTMLElement>('#last')!;
    pressTab(last);
    expect(document.activeElement).toBe(help);
    pressTab(help);
    expect(document.activeElement).toBe(last);
  });

  it('两帧自动聚焦也跳过 fieldset 继承禁用的首项', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => frames.push(callback));
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const root = mountContent(`
      <fieldset disabled><input></fieldset><button id="available">可用操作</button>
    `);
    disposers.push(scheduleAutoFocus(root));
    frames[0]!(0);
    frames[1]!(0);
    expect(document.activeElement).toBe(root.querySelector('#available'));
  });
});
