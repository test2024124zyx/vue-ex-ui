import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import ExCarousel from '../../../src/components/carousel/ExCarousel.vue';
import ExCarouselItem from '../../../src/components/carousel/ExCarouselItem.vue';

const mountCarousel = (modelValue = 0) =>
  mount(ExCarousel, {
    props: { modelValue, autoplay: false, arrow: 'always' },
    slots: {
      default: () =>
        ['A', 'B', 'C'].map(label => h(ExCarouselItem, { key: label }, { default: () => label })),
    },
  });

const flushMutation = async () => {
  await nextTick();
  await new Promise(resolve => window.setTimeout(resolve, 0));
  await nextTick();
};

describe('ExCarousel', () => {
  it('轻触而未滑动时不会误切换轮播项', async () => {
    const wrapper = mountCarousel();
    const track = wrapper.find('.ex-carousel__track');

    await track.trigger('touchstart', {
      touches: [{ clientX: 120, clientY: 60 }],
    });
    await track.trigger('touchend');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('滑动距离超过阈值时切换到下一项', async () => {
    const wrapper = mountCarousel();
    const track = wrapper.find('.ex-carousel__track');

    await track.trigger('touchstart', {
      touches: [{ clientX: 120, clientY: 60 }],
    });
    await track.trigger('touchmove', {
      touches: [{ clientX: 20, clientY: 62 }],
    });
    await track.trigger('touchend');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
  });

  it('删除末尾激活项后收敛索引并同步 v-model', async () => {
    const items = ref(['A', 'B', 'C']);
    const host = defineComponent({
      setup() {
        return () =>
          h(
            ExCarousel,
            { modelValue: 2, autoplay: false },
            {
              default: () =>
                items.value.map(label =>
                  h(ExCarouselItem, { key: label }, { default: () => label })
                ),
            }
          );
      },
    });
    const wrapper = mount(host);
    const carousel = wrapper.findComponent(ExCarousel);

    items.value = ['A', 'B'];
    await flushMutation();

    expect(carousel.emitted('update:modelValue')?.at(-1)).toEqual([1]);
    expect(carousel.find('.ex-carousel-item--active').text()).toBe('B');
  });

  it('子项重排后按真实 DOM 顺序重新计算索引', async () => {
    const items = ref(['A', 'B', 'C']);
    const host = defineComponent({
      setup() {
        return () =>
          h(
            ExCarousel,
            { modelValue: 1, autoplay: false },
            {
              default: () =>
                items.value.map(label =>
                  h(ExCarouselItem, { key: label }, { default: () => label })
                ),
            }
          );
      },
    });
    const wrapper = mount(host);
    const carousel = wrapper.findComponent(ExCarousel);

    items.value = ['C', 'A', 'B'];
    await flushMutation();

    expect(carousel.find('.ex-carousel-item--active').text()).toBe('A');
    expect(
      carousel
        .findAll('.ex-carousel-item')
        .map(item => item.attributes('aria-label')?.split(' ').at(-1))
    ).toEqual(['1', '2', '3']);
  });

  it('挂载后将越界初始索引修正到最后一项', async () => {
    const wrapper = mountCarousel(99);
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2]);
    expect(wrapper.find('.ex-carousel-item--active').text()).toBe('C');
  });

  it('轮播项脱离轮播容器使用时明确抛出错误', () => {
    expect(() => mount(ExCarouselItem)).toThrow('ExCarouselItem 必须作为 ExCarousel 的子组件使用');
  });
});
