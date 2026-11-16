import { createApp, h } from 'vue';
import ExFileUpload from '../../src/components/file-upload/ExFileUpload.vue';
import type { UploadFile } from '../../src/components/file-upload/types';
import '../../src/styles/index.scss';

const file: UploadFile = {
  uid: 'initial',
  name: '报告.txt',
  size: 4,
  type: 'text/plain',
  status: 'ready',
};
document.documentElement.dataset.theme =
  new URLSearchParams(location.search).get('theme') ?? 'light';

createApp({
  render: () =>
    (['text', 'picture', 'picture-card'] as const).map(listType =>
      h(ExFileUpload, { listType, autoUpload: false, fileList: [file] })
    ),
}).mount('#app');
