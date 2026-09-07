import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { CarouselDirection, CarouselEffect } from './types';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

export interface CarouselContext {
  currentIndex: Ref<number>;
  direction: ComputedRef<CarouselDirection>;
  effect: ComputedRef<CarouselEffect>;
  registerItem: (uid: number, element?: HTMLElement) => void;
  unregisterItem: (uid: number) => void;
  getItemIndex: (uid: number) => number;
}

/** 使用符号隔离不同组件上下文，避免字符串注入键发生碰撞。 */
export const carouselContextKey: InjectionKey<CarouselContext> =
  createSharedInjectionKey('carousel');
