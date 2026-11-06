import ExCarouselComponent from './ExCarousel.vue';
import ExCarouselItemComponent from './ExCarouselItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExCarouselItem: InstallableComponent<typeof ExCarouselItemComponent> =
  withInstall(ExCarouselItemComponent);
export const ExCarousel: InstallableComponent<typeof ExCarouselComponent> = withInstall(
  ExCarouselComponent,
  { ExCarouselItem }
);

export default ExCarousel;
export type * from './types';
