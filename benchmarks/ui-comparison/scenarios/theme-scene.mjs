import { h, ref } from 'vue';
import { ExConfigProvider } from '../../../dist/es/components/config-provider/index.js';
import { ExModal } from '../../../dist/es/components/modal/index.js';
import { ExAvatar, ExAvatarGroup } from '../../../dist/es/components/avatar/index.js';
import { ExImage } from '../../../dist/es/components/image/index.js';
import { ExDivider } from '../../../dist/es/components/divider/index.js';
import { ExCard } from '../../../dist/es/components/card/index.js';

const samples = id => h('section', { 'data-theme-sample': id }, [
  h(ExAvatar, { text: '主题' }),
  h(ExAvatarGroup, {}, () => [h(ExAvatar, { text: '甲' }), h(ExAvatar, { text: '乙' })]),
  h(ExImage, { src: 'data:image/png;base64,invalid', lazy: false, width: 160, height: 100 }),
  h(ExDivider, { dashed: true }, () => '主题分割线'),
  h(ExCard, { shadow: 'md' }, () => '主题阴影'),
]);

export function themeInheritance() {
  const theme = ref('light');
  const overrides = ref({});
  return {
    state: () => ({ theme: theme.value, overrides: overrides.value }),
    actions: {
      dark: () => { theme.value = 'neon-pink'; },
      light: () => { theme.value = 'light'; },
      semanticOverride: () => { overrides.value = {
        '--ex-color-bg-elevated': '#ddeeff', '--ex-color-text-primary': '#123456',
        '--ex-color-text-secondary': '#345678', '--ex-color-black-alpha-30': 'rgba(10, 20, 30, 0.4)',
      }; },
      componentOverride: () => { overrides.value = {
        '--ex-modal-background': '#aabbcc', '--ex-avatar-text-color': '#abcdef',
        '--ex-divider-color': '#fedcba', '--ex-image-error-text-color': '#987654',
      }; },
      reset: () => { overrides.value = {}; },
    },
    render: () => h(ExConfigProvider, { theme: theme.value, themeOverrides: overrides.value, animation: false }, {
      default: () => [samples('local'),
        h(ExConfigProvider, { theme: 'neon-blue' }, () => samples('nested')),
        h(ExModal, { modelValue: true, appendToBody: true, title: '主题回归', showFooter: false }, () => '局部主题传送弹窗'),
      ],
    }),
  };
}
