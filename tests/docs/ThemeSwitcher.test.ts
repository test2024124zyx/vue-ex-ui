import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeSwitcher from '../../docs/.vitepress/theme/ThemeSwitcher.vue';
import { getTheme, setTheme } from '../../src';

describe('文档主题切换器', () => {
  beforeEach(() => {
    localStorage.removeItem('ex-ui-theme');
    setTheme('neon-blue');
  });

  afterEach(() => {
    localStorage.removeItem('ex-ui-theme');
  });

  it('只在当前注册的主题之间切换', async () => {
    const wrapper = mount(ThemeSwitcher);

    expect(wrapper.text()).toContain('Cyber Dark');

    await wrapper.get('button').trigger('click');
    expect(getTheme()).toBe('light');
    expect(wrapper.text()).toContain('Cyber Light');

    await wrapper.get('button').trigger('click');
    expect(getTheme()).toBe('neon-blue');
  });

  it('忽略已废弃主题的本地存储值', () => {
    localStorage.setItem('ex-ui-theme', 'neon-pink');

    const wrapper = mount(ThemeSwitcher);

    expect(getTheme()).toBe('neon-blue');
    expect(wrapper.text()).toContain('Cyber Dark');
  });
});
