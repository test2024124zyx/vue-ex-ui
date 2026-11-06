import { createApp, h } from 'vue';
import { ExButton } from '@probe-button';
import '@probe-style';

// 最小公开消费入口用于比较发行产物，不走 src 的源码别名。
createApp({ render: () => h(ExButton, {}, () => '性能测试') }).mount('#app');
