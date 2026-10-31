import { createApp, h, ref } from 'vue';
import { ExConfigProvider, ExFileUpload } from '../../src';
import type { ExFileUploadExposed, UploadFile, UploadListType } from '../../src';
import '../../src/style-full';

const params = new URLSearchParams(location.search);
const view = params.get('view');
const listType: UploadListType = view === 'picture' || view === 'picture-card' ? view : 'text';
const theme = params.get('theme') === 'neon-blue' ? 'neon-blue' : 'light';
const files = ref<UploadFile[]>([]);
const uploader = ref<ExFileUploadExposed>();
const account = ref('account-a');
const CHUNK_BYTES = 16;
document.documentElement.dataset.theme = theme;
document.body.style.margin = '0';

createApp({
  render: () =>
    h(
      ExConfigProvider,
      { theme, locale: 'zh-CN' },
      {
        default: () =>
          h(
            'main',
            {
              class: 'ex-app',
              style: {
                padding: '24px',
                boxSizing: 'border-box',
                maxWidth: '720px',
                margin: '0 auto',
              },
            },
            [
              h('h1', { style: { fontSize: '20px' } }, '文件上传'),
              h(ExFileUpload, {
                ref: uploader,
                fileList: files.value,
                'onUpdate:fileList': value => {
                  files.value = value;
                },
                transport: 'tus',
                action: params.get('endpoint') ?? '',
                tus: { chunkSize: CHUNK_BYTES, retryDelays: [], resumeKey: account.value },
                headers: { 'X-Api-Key': `dummy-${account.value}` },
                concurrency: 1,
                autoUpload: false,
                multiple: true,
                listType,
              }),
              h(
                'button',
                { id: 'submit-all', type: 'button', onClick: () => void uploader.value?.submit() },
                '开始全部'
              ),
              h(
                'button',
                {
                  id: 'switch-account',
                  type: 'button',
                  onClick: () => {
                    account.value = 'account-b';
                  },
                },
                '切换测试账号'
              ),
              h(
                'output',
                {
                  id: 'file-state',
                  style: { display: 'block', marginTop: '16px', overflowWrap: 'anywhere' },
                },
                JSON.stringify(
                  files.value.map(({ name, status, percent, tusUploadUrl }) => ({
                    name,
                    status,
                    percent,
                    tusUploadUrl,
                  }))
                )
              ),
            ]
          ),
      }
    ),
}).mount('#app');
document.documentElement.dataset.ready = 'true';
