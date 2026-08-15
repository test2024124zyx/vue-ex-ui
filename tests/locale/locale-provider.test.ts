import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';
import { vi } from 'vitest';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import type { LocaleMessages } from '../../src/locale';
import {
  createLocaleProvider,
  enUS,
  getCurrentLocale,
  setLocale,
  t,
  useI18n,
  useLocale,
  zhCN,
} from '../../src/locale';

const collectLocalePaths = (value: unknown, parentPath = ''): string[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`内置语言包 ${parentPath || '<root>'} 必须是对象`);
  }
  return Object.entries(value).flatMap(([key, child]) => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    if (typeof child === 'string') return [path];
    if (!child || typeof child !== 'object' || Array.isArray(child)) {
      throw new TypeError(`内置语言包 ${path} 的叶子必须是字符串`);
    }
    return [path, ...collectLocalePaths(child, path)];
  });
};

const flushLocaleProvider = async (): Promise<void> => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
};

const LocalizedProbe = defineComponent({
  name: 'LocalizedProbe',
  setup() {
    const composer = useI18n();
    return () => h('span', composer.t('pagination.pagination'));
  },
});

describe('locale provider', () => {
  beforeEach(() => {
    setLocale('en-US');
  });

  it('全局语言切换始终同步 getCurrentLocale', () => {
    setLocale('zh-CN');

    expect(getCurrentLocale()).toBe('zh-CN');
  });

  it('内置中英文语言包拥有完全一致的深层键且叶子均为字符串', () => {
    expect(collectLocalePaths(zhCN).sort()).toEqual(collectLocalePaths(enUS).sort());
  });

  it('翻译键只遍历语言包自身属性并拒绝原型链键', () => {
    const pollutedKey = 'localePrototypePolluted';
    Object.defineProperty(Object.prototype, pollutedKey, {
      configurable: true,
      value: '不应读取的宿主原型文案',
    });

    try {
      expect(t(pollutedKey)).toBe(pollutedKey);
      expect(t(`common.${pollutedKey}`)).toBe(`common.${pollutedKey}`);
      expect(t(`__proto__.${pollutedKey}`)).toBe(`__proto__.${pollutedKey}`);
      expect(t('constructor')).toBe('constructor');
    } finally {
      Reflect.deleteProperty(Object.prototype, pollutedKey);
    }
  });

  it('每个 Vue App 拥有独立的语言状态', async () => {
    const english = mount(LocalizedProbe, {
      global: { plugins: [createLocaleProvider({ locale: 'en-US' })] },
    });
    const chinese = mount(LocalizedProbe, {
      global: { plugins: [createLocaleProvider({ locale: 'zh-CN' })] },
    });

    await flushLocaleProvider();

    expect(english.text()).toBe('Pagination');
    expect(chinese.text()).toBe('分页');
    expect(getCurrentLocale()).toBe('en-US');
  });

  it('ConfigProvider 只覆盖语言选择且保留当前 App 的自定义文案', async () => {
    const ScopedProbe = defineComponent({
      name: 'ScopedLocaleProbe',
      setup() {
        const { t } = useLocale('pagination');
        return () => h('span', `${t('pagination')}|${t('total', { total: 3 })}`);
      },
    });
    const wrapper = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: () => h(ScopedProbe) },
      global: {
        plugins: [
          createLocaleProvider({
            locale: 'zh-CN',
            messages: {
              pagination: {
                pagination: '应用自定义分页',
              },
            },
          }),
        ],
      },
    });

    await flushLocaleProvider();

    expect(wrapper.text()).toBe('应用自定义分页|共 3 条数据');
    expect(zhCN.pagination.pagination).toBe('分页');
    await wrapper.setProps({ locale: 'en-US' });
    expect(wrapper.text()).toBe('Pagination|Total 3 items');
  });

  it.each([42, { nested: '错误结构' }])('拒绝运行时非字符串翻译叶子：%o', invalidLeaf => {
    const messages = {
      pagination: { pagination: invalidLeaf },
    } as unknown as LocaleMessages;

    expect(() => createLocaleProvider({ locale: 'zh-CN', messages })).toThrowError(
      '自定义语言包 pagination.pagination 必须是字符串'
    );
  });

  it('App 卸载时停止隔离翻译器的监听与异步接入', () => {
    let dispose: (() => void) | undefined;
    const app = {
      provide: vi.fn(),
      onUnmount: vi.fn((callback: () => void) => {
        dispose = callback;
      }),
    } as unknown as App;

    createLocaleProvider({ locale: 'zh-CN' }).install(app);

    expect(app.onUnmount).toHaveBeenCalledOnce();
    expect(dispose).toBeTypeOf('function');
    expect(() => dispose?.()).not.toThrow();
  });

  it('交互组件的默认导航文案同时提供中英文词条', async () => {
    const NavigationProbe = defineComponent({
      setup() {
        const composer = useI18n();
        return () => h('span', `${composer.t('anchor.label')}|${composer.t('backTop.label')}`);
      },
    });
    const english = mount(NavigationProbe, {
      global: { plugins: [createLocaleProvider({ locale: 'en-US' })] },
    });
    const chinese = mount(NavigationProbe, {
      global: { plugins: [createLocaleProvider({ locale: 'zh-CN' })] },
    });

    await flushLocaleProvider();

    expect(english.text()).toBe('Anchor navigation|Back to top');
    expect(chinese.text()).toBe('锚点导航|返回顶部');
  });
});
