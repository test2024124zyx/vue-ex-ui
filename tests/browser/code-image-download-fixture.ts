import { createApp, h, nextTick, onMounted, ref } from 'vue';
import ExBarcode from '../../src/components/barcode/ExBarcode.vue';
import type { ExBarcodeExposed } from '../../src/components/barcode/types';
import ExQRCode from '../../src/components/qrcode/ExQRCode.vue';
import type { ExQRCodeExposed } from '../../src/components/qrcode/types';

createApp({
  setup() {
    const barcode = ref<ExBarcodeExposed>();
    const qrcode = ref<ExQRCodeExposed>();
    const ready = ref(false);
    onMounted(async () => {
      await nextTick();
      await Promise.all([barcode.value?.refresh(), qrcode.value?.refresh()]);
      ready.value = true;
    });
    return () => [
      h(ExBarcode, { ref: barcode, value: '123456789' }),
      h(ExQRCode, { ref: qrcode, value: 'https://example.com' }),
      h(
        'button',
        { disabled: !ready.value, onClick: () => barcode.value?.download('barcode.png') },
        '下载条码'
      ),
      h(
        'button',
        { disabled: !ready.value, onClick: () => qrcode.value?.download('qrcode.png') },
        '下载二维码'
      ),
    ];
  },
}).mount('#app');
