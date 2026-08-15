import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount, type ComponentMountingOptions, type VueWrapper } from '@vue/test-utils';
import ExInput from '../../../src/components/input/ExInput.vue';
import type {
  ExInputExposed,
  ExInputProps,
  InputSize,
  InputStatus,
  InputVariant,
} from '../../../src/components/input/types';
import { FORM_ITEM_INJECTION_KEY } from '../../../src/components/form/use-form-item';
import { setLocale } from '../../../src/locale';

describe('ExInput', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    setLocale('en-US');
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.replaceChildren();
    setLocale('en-US');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /** 所有挂载均附着到文档，以验证真实焦点和选择区行为。 */
  const mountInput = (options: ComponentMountingOptions<typeof ExInput> = {}) => {
    wrapper = mount(ExInput, {
      ...options,
      attachTo: document.body,
    });
    return wrapper;
  };

  it('默认渲染文本输入框，并把标准 class/style 留在组件根节点', () => {
    const inputWrapper = mountInput({
      attrs: {
        class: 'consumer-input',
        style: 'max-width: 20rem',
      },
    });

    expect(inputWrapper.classes()).toEqual(
      expect.arrayContaining(['ex-input', 'ex-input--medium', 'ex-input--neon', 'consumer-input'])
    );
    expect(inputWrapper.attributes('style')).toContain('max-width: 20rem');
    expect(inputWrapper.get('input').attributes('type')).toBe('text');
    expect(inputWrapper.get('.ex-input__prompt').text()).toBe('>');
  });

  it('把原生输入属性和事件转发给真实控件，而不是错误地落到外层容器', async () => {
    const handlePaste = vi.fn();
    const inputWrapper = mountInput({
      props: {
        id: 'account',
      },
      attrs: {
        name: 'account',
        inputmode: 'email',
        'aria-label': 'Account',
        'data-native': 'yes',
        onPaste: handlePaste,
      },
    });
    const input = inputWrapper.get('input');

    expect(inputWrapper.attributes('id')).toBeUndefined();
    expect(inputWrapper.attributes('name')).toBeUndefined();
    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: 'account',
        name: 'account',
        inputmode: 'email',
        'aria-label': 'Account',
        'data-native': 'yes',
      })
    );

    await input.trigger('paste');
    expect(handlePaste).toHaveBeenCalledOnce();
  });

  it('标签与真实控件关联，required 同时提供原生约束和可访问语义', () => {
    const inputWrapper = mountInput({
      props: {
        id: 'username',
        label: '用户名',
        required: true,
        helpText: '请输入用户名',
      },
    });
    const input = inputWrapper.get('input');

    expect(inputWrapper.get('label').attributes('for')).toBe('username');
    expect(inputWrapper.get('.ex-input__required').attributes('aria-hidden')).toBe('true');
    expect(input.attributes('required')).toBeDefined();
    expect(input.attributes('aria-describedby')).toBe('username-message');
    expect(inputWrapper.get('.ex-input__message').attributes('id')).toBe('username-message');
  });

  it('数字初值 0 不会被当作空值，用户编辑后统一发出字符串模型值', async () => {
    const inputWrapper = mountInput({
      props: {
        modelValue: 0,
      },
    });
    const input = inputWrapper.get('input');

    expect((input.element as HTMLInputElement).value).toBe('0');
    await input.setValue('12');

    expect(inputWrapper.emitted('update:modelValue')).toEqual([['12']]);
    expect(inputWrapper.emitted('input')?.[0]?.[0]).toBe('12');
    expect(inputWrapper.emitted('input')?.[0]?.[1]).toBeInstanceOf(Event);
  });

  it('支持 v-model 的 trim 与 number 修饰符，并不把 modelModifiers 转发到原生控件', async () => {
    const inputWrapper = mountInput({
      props: {
        modelModifiers: { trim: true, number: true },
      },
    });
    const input = inputWrapper.get('input');

    await input.setValue(' 42 ');

    expect(inputWrapper.emitted('update:modelValue')).toEqual([[42]]);
    expect(inputWrapper.emitted('input')?.[0]?.[0]).toBe(42);
    expect(input.attributes('modelModifiers')).toBeUndefined();
  });

  it('lazy 修饰符只在 change 时提交模型，并在提交后通知 FormItem change 链路', async () => {
    const onFieldChange = vi.fn();
    const inputWrapper = mountInput({
      props: {
        modelModifiers: { lazy: true },
      },
      global: {
        provide: {
          [FORM_ITEM_INJECTION_KEY as symbol]: {
            onFieldChange,
            onFieldBlur: vi.fn(),
          },
        },
      },
    });
    const input = inputWrapper.get('input');

    (input.element as HTMLInputElement).value = 'lazy';
    await input.trigger('input');
    expect(inputWrapper.emitted('update:modelValue')).toBeUndefined();
    expect(onFieldChange).not.toHaveBeenCalled();

    await input.trigger('change');
    expect(inputWrapper.emitted('update:modelValue')).toEqual([['lazy']]);
    expect(onFieldChange).toHaveBeenCalledOnce();
  });

  it('formatter 只控制显示值，parser 统一控制 input、change 和模型值', async () => {
    const formatter = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const parser = (value: string) => value.replaceAll(',', '');
    const inputWrapper = mountInput({
      props: {
        modelValue: '1234',
        formatter,
        parser,
      },
    });
    const input = inputWrapper.get('input');

    expect((input.element as HTMLInputElement).value).toBe('1,234');

    await input.setValue('2,345');
    expect(inputWrapper.emitted('update:modelValue')).toEqual([['2345']]);
    expect(inputWrapper.emitted('input')?.[0]?.[0]).toBe('2345');
    expect((input.element as HTMLInputElement).value).toBe('2,345');

    await input.trigger('change');
    expect(inputWrapper.emitted('change')?.[0]?.[0]).toBe('2345');
  });

  it('格式化更新显示值后保持编辑位置，不强制把光标移动到末尾', async () => {
    const inputWrapper = mountInput({
      props: {
        formatter: value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        parser: value => value.replaceAll(',', ''),
      },
    });
    const input = inputWrapper.get('input').element as HTMLInputElement;

    input.value = '1234';
    input.setSelectionRange(2, 2);
    await inputWrapper.get('input').trigger('input');

    expect(input.value).toBe('1,234');
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);
  });

  it('本地规则默认在失焦时校验，实时校验需要显式配置 validateTrigger', async () => {
    const inputWrapper = mountInput({
      props: {
        modelValue: 'valid',
        rules: [value => Boolean(value) || '内容不能为空'],
      },
    });
    const input = inputWrapper.get('input');

    await input.setValue('');
    expect(inputWrapper.emitted('validation-error')).toBeUndefined();

    await input.trigger('blur');
    expect(inputWrapper.emitted('validation-error')).toEqual([['内容不能为空']]);
  });

  it('输入法组合期间不更新模型、不格式化也不校验，结束后只提交一次', async () => {
    const inputWrapper = mountInput({
      props: {
        rules: [value => value.length <= 2 || '内容过长'],
        validateTrigger: 'input',
      },
    });
    const input = inputWrapper.get('input');

    await input.trigger('compositionstart');
    await input.setValue('中文长');

    expect(inputWrapper.emitted('update:modelValue')).toBeUndefined();
    expect(inputWrapper.emitted('validation-error')).toBeUndefined();
    expect((input.element as HTMLInputElement).value).toBe('中文长');

    await input.trigger('compositionend');
    expect(inputWrapper.emitted('update:modelValue')).toEqual([['中文长']]);
    expect(inputWrapper.emitted('validation-error')).toEqual([['内容过长']]);
  });

  it.each<[InputSize, string]>([
    ['small', 'ex-input--small'],
    ['medium', 'ex-input--medium'],
    ['large', 'ex-input--large'],
  ])('size=%s 应用确定的尺寸类', (size, className) => {
    expect(mountInput({ props: { size } }).classes()).toContain(className);
  });

  it.each<[InputVariant, string]>([
    ['neon', 'ex-input--neon'],
    ['ghost', 'ex-input--ghost'],
    ['filled', 'ex-input--filled'],
  ])('variant=%s 应用确定的变体类', (variant, className) => {
    expect(mountInput({ props: { variant } }).classes()).toContain(className);
  });

  it('neon 变体使用当前主题主色而不是固定蓝色令牌', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/input/ExInput.scss'),
      'utf8'
    );
    const neonBlock = stylesheet.match(/\.ex-input--neon\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

    expect(neonBlock).toContain('--ex-input-border-color: var(--ex-color-primary)');
    expect(neonBlock).not.toContain('--ex-color-neon-blue-500');
  });

  it('聚焦态只使用外层边框，不再绘制内部重复轮廓', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/input/ExInput.scss'),
      'utf8'
    );

    expect(stylesheet).toContain('.ex-input--focused');
    expect(stylesheet).toContain('border-color: var(--ex-color-primary);');
    expect(stylesheet).not.toContain(
      'filter: drop-shadow(0 0 4px var(--ex-color-primary-alpha-20))'
    );
  });

  it('重置基础表单样式，避免原生焦点阴影在前缀图标后形成竖线', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/input/ExInput.scss'),
      'utf8'
    );
    const controlBlock =
      stylesheet.match(/\.ex-input__control\s*\{([\s\S]*?)\n\n {2}&::placeholder/)?.[1] ?? '';

    expect(controlBlock).toContain('border: 0;');
    expect(controlBlock).toContain('outline: 0;');
    expect(controlBlock).toContain('box-shadow: none;');
    expect(stylesheet).toContain(
      '  &:focus {\n    border: 0;\n    outline: 0;\n    box-shadow: none;\n  }'
    );
  });

  it('带前后置内容时把切角应用在整个组合外框', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/input/ExInput.scss'),
      'utf8'
    );

    expect(stylesheet).toContain(
      '.ex-input--with-prepend .ex-input__wrapper,\n.ex-input--with-append .ex-input__wrapper {\n  @include chamfer(var(--ex-chamfer-sm));\n}'
    );
    expect(stylesheet).toContain(
      '.ex-input--with-prepend .ex-input__inner,\n.ex-input--with-append .ex-input__inner {\n  clip-path: none;\n}'
    );
  });

  it('支持控制终端提示符的内容与显隐，并由 prefix 插槽优先', async () => {
    const inputWrapper = mountInput({
      props: {
        prompt: '$',
      },
    });

    expect(inputWrapper.get('.ex-input__prompt').text()).toBe('$');

    await inputWrapper.setProps({ showPrompt: false });
    expect(inputWrapper.find('.ex-input__prompt').exists()).toBe(false);

    const emptyPromptWrapper = mountInput({ props: { prompt: '' } });
    expect(emptyPromptWrapper.find('.ex-input__prompt').exists()).toBe(false);

    const ghostWrapper = mountInput({ props: { prompt: '$', variant: 'ghost' } });
    expect(ghostWrapper.find('.ex-input__prompt').exists()).toBe(false);

    const prefixWrapper = mountInput({
      slots: {
        prefix: '<span class="custom-prefix">$</span>',
      },
    });
    expect(prefixWrapper.find('.ex-input__prompt').exists()).toBe(false);
    expect(prefixWrapper.find('.custom-prefix').exists()).toBe(true);
  });

  it('通过真实提示符节点渲染可控文本，而不是依赖硬编码伪元素', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/input/ExInput.scss'),
      'utf8'
    );

    expect(stylesheet).toContain('.ex-input__prompt');
    expect(stylesheet).not.toContain("content: '>';");
  });

  it.each<[InputStatus, string]>([
    ['success', 'ex-input--success'],
    ['warning', 'ex-input--warning'],
    ['error', 'ex-input--error'],
  ])('status=%s 应用确定的状态类', (status, className) => {
    expect(mountInput({ props: { status } }).classes()).toContain(className);
  });

  it.each<Pick<ExInputProps, 'disabled' | 'readonly'>>([{ disabled: true }, { readonly: true }])(
    'disabled/readonly 禁止用户清空和切换密码',
    props => {
      const inputWrapper = mountInput({
        props: {
          ...props,
          type: 'password',
          modelValue: 'secret',
          clearable: true,
          showPassword: true,
        },
      });
      const input = inputWrapper.get('input');

      if (props.disabled) expect(input.attributes('disabled')).toBeDefined();
      if (props.readonly) expect(input.attributes('readonly')).toBeDefined();
      expect(inputWrapper.find('.ex-input__action').exists()).toBe(false);
    }
  );

  it('清空按钮使用原生 button，更新模型、触发校验并把焦点还给输入框', async () => {
    const inputWrapper = mountInput({
      props: {
        modelValue: 'content',
        clearable: true,
        rules: [value => Boolean(value) || '内容不能为空'],
        validateTrigger: 'change',
      },
    });
    const button = inputWrapper.get('.ex-input__action--clear');
    const input = inputWrapper.get('input');

    expect(button.element.tagName).toBe('BUTTON');
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBe('Clear');

    await button.trigger('click');
    await nextTick();

    expect(inputWrapper.emitted('update:modelValue')).toEqual([['']]);
    expect(inputWrapper.emitted('clear')).toEqual([[]]);
    expect(inputWrapper.emitted('validation-error')).toEqual([['内容不能为空']]);
    expect(document.activeElement).toBe(input.element);
  });

  it('密码切换按钮暴露按压状态，并在切换后保持焦点和选择区', async () => {
    const inputWrapper = mountInput({
      props: {
        type: 'password',
        modelValue: 'secret',
        showPassword: true,
      },
    });
    const input = inputWrapper.get('input');
    const button = inputWrapper.get('.ex-input__action--password');

    (input.element as HTMLInputElement).focus();
    (input.element as HTMLInputElement).setSelectionRange(1, 4);
    expect(button.attributes('aria-pressed')).toBe('false');

    await button.trigger('click');
    await nextTick();

    expect(input.attributes('type')).toBe('text');
    expect(button.attributes('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(input.element);
    expect((input.element as HTMLInputElement).selectionStart).toBe(1);
    expect((input.element as HTMLInputElement).selectionEnd).toBe(4);

    await inputWrapper.setProps({ showPassword: false });
    await inputWrapper.setProps({ showPassword: true });
    expect(input.attributes('type')).toBe('password');
    expect(inputWrapper.get('.ex-input__action--password').attributes('aria-pressed')).toBe(
      'false'
    );
  });

  it('字数统计正确处理数字 0 和 maxlength=0', async () => {
    const inputWrapper = mountInput({
      props: {
        modelValue: 0,
        showWordLimit: true,
        maxlength: 10,
      },
    });

    expect(inputWrapper.get('.ex-input__word-limit').text()).toBe('1/10');

    await inputWrapper.setProps({
      modelValue: '',
      maxlength: 0,
    });
    expect(inputWrapper.get('.ex-input__word-limit').text()).toBe('0/0');
    expect(inputWrapper.get('input').attributes('maxlength')).toBe('0');
  });

  it('渲染前后缀和前后置内容，空插槽不会制造多余容器', () => {
    const inputWrapper = mountInput({
      props: {
        prepend: 'https://',
        append: '.com',
      },
      slots: {
        prefix: '<span class="prefix-content">搜索</span>',
        suffix: '<span class="suffix-content">状态</span>',
      },
    });

    expect(inputWrapper.get('.ex-input__prepend').text()).toBe('https://');
    expect(inputWrapper.get('.ex-input__append').text()).toBe('.com');
    expect(inputWrapper.find('.prefix-content').exists()).toBe(true);
    expect(inputWrapper.find('.suffix-content').exists()).toBe(true);
  });

  it('帮助文本与外部 aria-describedby 合并且去重，不伪装成警报', () => {
    const inputWrapper = mountInput({
      props: {
        id: 'email',
        helpText: '请输入有效邮箱',
      },
      attrs: {
        'aria-describedby': 'external external',
      },
    });
    const message = inputWrapper.get('.ex-input__message');

    expect(inputWrapper.get('input').attributes('aria-describedby')).toBe('external email-message');
    expect(message.attributes('role')).toBeUndefined();
    expect(message.text()).toBe('请输入有效邮箱');
  });

  it('错误消息使用 alert 和 aria-errormessage，成功状态使用 status 且真实可达', async () => {
    const inputWrapper = mountInput({
      props: {
        id: 'field',
        status: 'error',
        errorMessage: '字段无效',
      },
    });
    const input = inputWrapper.get('input');

    expect(input.attributes('aria-invalid')).toBe('true');
    expect(input.attributes('aria-errormessage')).toBe('field-message');
    expect(inputWrapper.get('.ex-input__message').attributes('role')).toBe('alert');
    expect(inputWrapper.get('.ex-input__message').attributes('aria-live')).toBe('assertive');

    await inputWrapper.setProps({
      status: 'success',
      errorMessage: undefined,
    });

    expect(input.attributes('aria-invalid')).toBeUndefined();
    expect(input.attributes('aria-errormessage')).toBeUndefined();
    expect(inputWrapper.get('.ex-input__message').attributes('role')).toBe('status');
    expect(inputWrapper.get('.ex-input__success-text').text()).toBe('Validation passed');
  });

  it('验证使用首个失败结果，空错误信息回退到本地化文案，并在外部值变化后清理旧错误', async () => {
    setLocale('zh-CN');
    const secondRule = vi.fn(() => '不应执行');
    const inputWrapper = mountInput({
      props: {
        modelValue: '',
        rules: [() => '', secondRule],
      },
    });
    const exposed = inputWrapper.vm as unknown as ExInputExposed;

    expect(exposed.validate()).toBe(false);
    await nextTick();
    expect(secondRule).not.toHaveBeenCalled();
    expect(inputWrapper.get('.ex-input__error').text()).toContain('验证失败');
    expect(inputWrapper.emitted('validation-error')).toEqual([['验证失败']]);

    await inputWrapper.setProps({ modelValue: 'valid' });
    expect(inputWrapper.find('.ex-input__error').exists()).toBe(false);

    await inputWrapper.setProps({ rules: [() => true] });
    expect(exposed.validate()).toBe(true);
  });

  it('验证规则抛出的异常不会被组件伪装成普通校验失败', () => {
    const failure = new Error('规则异常');
    const inputWrapper = mountInput({
      props: {
        rules: [
          () => {
            throw failure;
          },
        ],
      },
    });
    const exposed = inputWrapper.vm as unknown as ExInputExposed;

    expect(() => exposed.validate()).toThrow(failure);
    expect(inputWrapper.emitted('validation-error')).toBeUndefined();
  });

  it('文本域只接收有效原生约束，并以 autosize 类标记真实自动高度状态', () => {
    const inputWrapper = mountInput({
      props: {
        type: 'textarea',
        rows: 0,
        minlength: 2,
        maxlength: -1,
        autosize: {
          minRows: 2,
          maxRows: 4,
        },
      },
    });
    const textarea = inputWrapper.get('textarea');

    expect(inputWrapper.classes()).toContain('ex-input--textarea');
    expect(inputWrapper.classes()).toContain('ex-input--autosize');
    expect(textarea.attributes('type')).toBeUndefined();
    expect(textarea.attributes('rows')).toBe('3');
    expect(textarea.attributes('minlength')).toBe('2');
    expect(textarea.attributes('maxlength')).toBeUndefined();
  });

  it('自动高度遵守最小/最大行数并在超出上限时恢复纵向滚动', async () => {
    let pendingFrame: FrameRequestCallback | null = null;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
      pendingFrame = callback;
      return 17;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      lineHeight: '20px',
      fontSize: '16px',
      paddingTop: '4px',
      paddingBottom: '4px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    } as CSSStyleDeclaration);

    const inputWrapper = mountInput({
      props: {
        type: 'textarea',
        autosize: {
          minRows: 2,
          maxRows: 4,
        },
      },
    });
    const textarea = inputWrapper.get('textarea');
    let scrollHeight = 120;
    Object.defineProperty(textarea.element, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    await textarea.setValue('很多内容');
    await nextTick();
    const firstFrame = pendingFrame as unknown as FrameRequestCallback | undefined;
    if (typeof firstFrame === 'function') firstFrame(0);
    expect((textarea.element as HTMLTextAreaElement).style.height).toBe('90px');
    expect((textarea.element as HTMLTextAreaElement).style.overflowY).toBe('auto');

    scrollHeight = 20;
    await textarea.setValue('少量');
    await nextTick();
    const secondFrame = pendingFrame as unknown as FrameRequestCallback | undefined;
    if (typeof secondFrame === 'function') secondFrame(16);
    expect((textarea.element as HTMLTextAreaElement).style.height).toBe('50px');
    expect((textarea.element as HTMLTextAreaElement).style.overflowY).toBe('hidden');

    await inputWrapper.setProps({ autosize: false });
    expect((textarea.element as HTMLTextAreaElement).style.height).toBe('');
    expect((textarea.element as HTMLTextAreaElement).style.overflowY).toBe('');
  });

  it('卸载时取消自动高度帧并断开尺寸观察器', async () => {
    const cancelFrame = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(23);
    const disconnect = vi.fn();
    const observe = vi.fn();

    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    const inputWrapper = mountInput({
      props: {
        type: 'textarea',
        autosize: true,
      },
    });

    await nextTick();
    expect(observe).toHaveBeenCalledOnce();

    inputWrapper.unmount();
    wrapper = null;
    expect(cancelFrame).toHaveBeenCalledWith(23);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('输入通知 FormItem 的 input 链路，清空通知 change 链路，失焦通知 blur 链路', async () => {
    const onFieldChange = vi.fn();
    const onFieldInput = vi.fn();
    const onFieldBlur = vi.fn();
    const inputWrapper = mountInput({
      props: {
        modelValue: 'a',
        clearable: true,
      },
      global: {
        provide: {
          [FORM_ITEM_INJECTION_KEY as symbol]: {
            onFieldChange,
            onFieldInput,
            onFieldBlur,
          },
        },
      },
    });
    const input = inputWrapper.get('input');

    (input.element as HTMLInputElement).value = 'b';
    await input.trigger('input');
    expect(onFieldInput).toHaveBeenCalledOnce();
    expect(onFieldChange).not.toHaveBeenCalled();

    await input.trigger('blur');
    expect(onFieldBlur).toHaveBeenCalledOnce();

    await inputWrapper.get('.ex-input__action--clear').trigger('click');
    expect(onFieldChange).toHaveBeenCalledOnce();
  });

  it('完整转发 focus、blur、keydown、keyup、enter 和原生 change 事件', async () => {
    const inputWrapper = mountInput();
    const input = inputWrapper.get('input');

    await input.trigger('focus');
    await input.trigger('keydown', { key: 'Enter' });
    await input.trigger('keyup', { key: 'Enter' });
    await input.trigger('change');
    await input.trigger('blur');

    expect(inputWrapper.emitted('focus')).toHaveLength(1);
    expect(inputWrapper.emitted('keydown')).toHaveLength(1);
    expect(inputWrapper.emitted('keyup')).toHaveLength(1);
    expect(inputWrapper.emitted('enter')).toHaveLength(1);
    expect(inputWrapper.emitted('change')).toHaveLength(1);
    expect(inputWrapper.emitted('blur')).toHaveLength(1);
  });

  it('暴露的方法直接操作真实控件，且无规则时 validate 返回 true', async () => {
    const inputWrapper = mountInput({
      props: {
        modelValue: 'value',
      },
    });
    const input = inputWrapper.get('input').element as HTMLInputElement;
    const exposed = inputWrapper.vm as unknown as ExInputExposed;

    expect(exposed.getInputElement()).toBe(input);
    exposed.focus({ preventScroll: true });
    expect(document.activeElement).toBe(input);

    exposed.select();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(5);

    exposed.blur();
    expect(document.activeElement).not.toBe(input);
    expect(exposed.validate()).toBe(true);

    exposed.clear();
    await nextTick();
    expect(inputWrapper.emitted('update:modelValue')).toEqual([['']]);
  });

  it('无效 minlength、maxlength 和 rows 不会污染原生控件', () => {
    const inputWrapper = mountInput({
      props: {
        minlength: Number.NaN,
        maxlength: Number.POSITIVE_INFINITY,
        rows: -2,
      },
    });
    const input = inputWrapper.get('input');

    expect(input.attributes('minlength')).toBeUndefined();
    expect(input.attributes('maxlength')).toBeUndefined();
    expect(input.attributes('rows')).toBeUndefined();
  });

  it('空后缀插槽不会制造后缀容器', () => {
    const inputWrapper = mountInput({
      slots: {
        suffix: '   ',
      },
    });

    expect(inputWrapper.find('.ex-input__suffix').exists()).toBe(false);
  });
});
