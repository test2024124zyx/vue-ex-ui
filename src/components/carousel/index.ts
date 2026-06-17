import type { App } from 'vue';
import ExCarousel from './ExCarousel.vue';
import ExCarouselItem from './ExCarouselItem.vue';

const CarouselPlugin = {
  install(app: App) {
    app.component('ExCarousel', ExCarousel);
    app.component('ExCarouselItem', ExCarouselItem);
  },
};

export default CarouselPlugin;
export { ExCarousel, ExCarouselItem };
export type * from './types';
