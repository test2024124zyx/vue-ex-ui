import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref, watch } from 'vue';

const loadTheme = () => import('../../src/composables/useTheme');
const loadLocale = () => import('../../src/locale');
const loadOverlay = () => import('../../src/composables/overlay-manager');

const loadSharedKeys = async () => {
  const modules = await Promise.all([
    import('../../src/components/config-provider/types'),
    import('../../src/components/config-provider/service-scope'),
    import('../../src/locale'),
    import('../../src/components/form/use-form-item'),
    import('../../src/components/anchor/context'),
    import('../../src/components/checkbox/context'),
    import('../../src/components/collapse/context'),
    import('../../src/components/carousel/context'),
    import('../../src/components/dropdown/context'),
    import('../../src/components/layout/context'),
    import('../../src/components/menu/context'),
    import('../../src/components/tree/state'),
    import('../../src/components/message/message'),
    import('../../src/components/notification/notification'),
    import('../../src/components/loading/LoadingService'),
    import('../../src/components/loading-bar/loading-bar'),
  ]);
  return Object.fromEntries(
    modules.flatMap(module =>
      Object.entries(module).filter(([, value]) => typeof value === 'symbol')
    )
  );
};

describe('发布入口的模块副本共享契约', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    (await loadTheme()).setTheme('neon-blue');
    (await loadLocale()).setLocale('en-US');
    document.body.innerHTML = '';
    document.body.style.cssText = '';
    vi.restoreAllMocks();
  });

  it('两个主题模块副本共享响应式状态与一次性通知', async () => {
    const first = await loadTheme();
    vi.resetModules();
    const second = await loadTheme();
    first.setTheme('neon-blue');
    second.setTheme('neon-blue');
    const listener = vi.fn();
    const observed = vi.fn();
    const stopListener = second.onThemeChange(listener);
    const stopWatch = watch(second.useTheme().theme, observed);
    try {
      first.setTheme('light');
      await nextTick();
      expect(second.getTheme()).toBe('light');
      expect(second.useTheme().theme.value).toBe('light');
      expect(listener).toHaveBeenCalledExactlyOnceWith('light');
      expect(observed).toHaveBeenCalledTimes(1);
      second.setTheme('light');
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      stopListener();
      stopWatch();
    }
  });

  it('全局语言及翻译器跨副本共享并响应更新', async () => {
    const first = await loadLocale();
    vi.resetModules();
    const second = await loadLocale();
    first.setLocale('en-US');
    second.setLocale('en-US');
    first.setLocale('zh-CN');
    expect(second.getCurrentLocale()).toBe('zh-CN');
    expect(second.useI18n()).toBe(first.useI18n());
    expect(second.t('select.placeholder')).toBe(first.t('select.placeholder'));
    second.useI18n().setLocale?.('en-US');
    expect(first.getCurrentLocale()).toBe('en-US');
  });

  it('所有跨组件公共注入键在独立模块副本中保留相同身份', async () => {
    const first = await loadSharedKeys();
    vi.resetModules();
    const second = await loadSharedKeys();
    expect(Object.keys(first)).toHaveLength(18);
    for (const [name, key] of Object.entries(first)) {
      expect.soft(second[name], name).toBe(key);
    }
  });

  it('交错使用模块副本的 Provider、Form、FormItem 和控件仍继承完整业务状态', async () => {
    const firstProvider = (
      await import('../../src/components/config-provider/ExConfigProvider.vue')
    ).default;
    const firstForm = (await import('../../src/components/form/ExForm.vue')).default;
    const firstInput = (await import('../../src/components/input/ExInput.vue')).default;
    vi.resetModules();
    const secondProvider = (
      await import('../../src/components/config-provider/ExConfigProvider.vue')
    ).default;
    const secondItem = (await import('../../src/components/form/ExFormItem.vue')).default;
    const secondSelect = (await import('../../src/components/select/ExSelect.vue')).default;
    const state = reactive({ disabled: true, readonly: true });
    const model = reactive({ name: '' });
    const wrapper = mount(firstProvider, {
      props: {
        theme: 'light',
        locale: 'zh-CN',
        size: 'small',
        themeOverrides: { '--ex-color-primary': '#123456' },
      },
      slots: {
        default: () =>
          h(
            secondProvider,
            {},
            {
              default: () => [
                h(
                  firstForm,
                  { model, disabled: state.disabled, readonly: state.readonly },
                  {
                    default: () =>
                      h(
                        secondItem,
                        { prop: 'name', label: '姓名', help: '请输入姓名' },
                        {
                          default: () =>
                            h(firstInput, {
                              modelValue: model.name,
                              'onUpdate:modelValue': (value: string | number) => {
                                model.name = String(value);
                              },
                            }),
                        }
                      ),
                  }
                ),
                h(secondSelect, { options: [{ value: 'sh', label: '上海' }] }),
              ],
            }
          ),
      },
      attachTo: document.body,
    });
    try {
      const input = wrapper.get('input');
      expect((input.element as HTMLInputElement).disabled).toBe(true);
      expect((input.element as HTMLInputElement).readOnly).toBe(true);
      expect(wrapper.get('.ex-input').classes()).toContain('ex-input--small');
      expect(input.attributes('aria-labelledby')).toBe(
        wrapper.get('.ex-form-item__label').attributes('id')
      );
      expect(input.attributes('aria-describedby')).toBe(
        wrapper.get('.ex-form-item__help').attributes('id')
      );
      state.disabled = false;
      state.readonly = false;
      await nextTick();
      await input.setValue('跨入口输入');
      expect(model.name).toBe('跨入口输入');
      expect(wrapper.get('.ex-select__placeholder').text()).toBe('请选择');
      await wrapper.get('[role="combobox"]').trigger('click');
      await flushPromises();
      const panel = document.querySelector<HTMLElement>('[role="listbox"]');
      expect(panel?.dataset.theme).toBe('light');
      expect(panel?.style.getPropertyValue('--ex-color-primary')).toBe('#123456');
    } finally {
      wrapper.unmount();
    }
  });

  it('不同 Document 的主题和语言状态相互隔离', async () => {
    const theme = await loadTheme();
    const locale = await loadLocale();
    const originalDocument = document;
    theme.setTheme('light');
    locale.setLocale('zh-CN');
    const otherDocument = document.implementation.createHTMLDocument('独立页面');
    vi.stubGlobal('document', otherDocument);
    expect(theme.getTheme()).toBe('neon-blue');
    expect(locale.getCurrentLocale()).toBe('en-US');
    theme.setTheme('neon-blue');
    locale.setLocale('en-US');
    vi.stubGlobal('document', originalDocument);
    expect(theme.getTheme()).toBe('light');
    expect(locale.getCurrentLocale()).toBe('zh-CN');
  });

  it('服务端模块副本不通过浏览器注册表传播请求状态', async () => {
    vi.stubGlobal('document', undefined);
    vi.resetModules();
    const firstTheme = await loadTheme();
    const firstLocale = await loadLocale();
    firstTheme.setTheme('light');
    firstLocale.setLocale('zh-CN');
    vi.resetModules();
    const secondTheme = await loadTheme();
    const secondLocale = await loadLocale();
    expect(secondTheme.getTheme()).toBe('neon-blue');
    expect(secondLocale.getCurrentLocale()).toBe('en-US');
  });

  it('来自不同入口的浮层共享栈顶 Escape 与同一个监听器注销函数', async () => {
    const first = await loadOverlay();
    vi.resetModules();
    const second = await loadOverlay();
    const parentClose = vi.fn();
    const childClose = vi.fn();
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const unregisterParent = first.registerOverlay({
      canEscape: () => true,
      onEscape: parentClose,
    });
    const unregisterChild = second.registerOverlay({ canEscape: () => true, onEscape: childClose });
    try {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
      expect(parentClose).not.toHaveBeenCalled();
      expect(childClose).toHaveBeenCalledTimes(1);
      unregisterParent();
      unregisterChild();
      const keydownAdds = add.mock.calls.filter(([name]) => name === 'keydown');
      const keydownRemoves = remove.mock.calls.filter(([name]) => name === 'keydown');
      expect(keydownAdds).toHaveLength(1);
      expect(keydownRemoves).toHaveLength(1);
      expect(keydownRemoves[0]?.[1]).toBe(keydownAdds[0]?.[1]);
    } finally {
      unregisterParent();
      unregisterChild();
    }
  });

  it('两个入口同时持有滚动锁时最后一个关闭才恢复原始样式', async () => {
    const first = await loadOverlay();
    vi.resetModules();
    const second = await loadOverlay();
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '7px';
    first.lockDocumentScroll();
    second.lockDocumentScroll();
    try {
      first.unlockDocumentScroll();
      expect(document.body.style.overflow).toBe('hidden');
      second.unlockDocumentScroll();
      expect(document.body.style.overflow).toBe('auto');
      expect(document.body.style.paddingRight).toBe('7px');
    } finally {
      first.unlockDocumentScroll();
      second.unlockDocumentScroll();
    }
  });

  it('不同文档的浮层相互隔离，注销时使用注册监听器的原始文档', async () => {
    const overlay = await loadOverlay();
    const originalDocument = document;
    const otherDocument = document.implementation.createHTMLDocument('独立浮层页面');
    const originalClose = vi.fn();
    const otherClose = vi.fn();
    const unregisterOriginal = overlay.registerOverlay({
      canEscape: () => true,
      onEscape: originalClose,
    });
    vi.stubGlobal('document', otherDocument);
    const unregisterOther = overlay.registerOverlay({
      canEscape: () => true,
      onEscape: otherClose,
    });
    try {
      originalDocument.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      );
      expect(originalClose).toHaveBeenCalledTimes(1);
      expect(otherClose).not.toHaveBeenCalled();
      unregisterOriginal();
      originalDocument.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      );
      expect(originalClose).toHaveBeenCalledTimes(1);
      otherDocument.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      );
      expect(otherClose).toHaveBeenCalledTimes(1);
    } finally {
      unregisterOriginal();
      unregisterOther();
      vi.stubGlobal('document', originalDocument);
    }
  });

  it('跨入口子浮层继承父层级和真实活动状态', async () => {
    const first = await import('../../src/composables/useOverlay');
    vi.resetModules();
    const second = await import('../../src/composables/useOverlay');
    const parentActive = ref(true);
    const Child = {
      setup() {
        const container = ref<HTMLElement>();
        const overlay = second.useOverlay({
          active: () => true,
          container,
          zIndex: () => 1000,
          autoFocus: () => false,
          trapFocus: () => false,
          lockScroll: () => false,
        });
        return () =>
          h(
            'button',
            { ref: container, style: { zIndex: overlay.zIndex.value } },
            String(overlay.active.value)
          );
      },
    };
    const wrapper = mount(
      {
        setup() {
          const container = ref<HTMLElement>();
          first.useOverlay({
            active: () => parentActive.value,
            container,
            zIndex: () => 1050,
            autoFocus: () => false,
            trapFocus: () => false,
            lockScroll: () => false,
          });
          return () => h('div', { ref: container }, [h(Child)]);
        },
      },
      { attachTo: document.body }
    );
    try {
      await nextTick();
      expect(Number((wrapper.get('button').element as HTMLElement).style.zIndex)).toBeGreaterThan(
        1050
      );
      parentActive.value = false;
      await nextTick();
      expect(wrapper.get('button').text()).toBe('false');
    } finally {
      wrapper.unmount();
    }
  });
});
