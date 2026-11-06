import { cloneVNode, defineComponent } from 'vue';
import type { PropType, VNode } from 'vue';
import type { AvatarShape, AvatarSize } from './types';

/** 克隆头像 VNode，保留插槽、事件、ref 与 key，并仅覆盖组级配置。 */
export default defineComponent({
  name: 'ExAvatarGroupItem',
  props: {
    vnode: {
      type: Object as PropType<VNode>,
      required: true,
    },
    size: {
      type: [String, Number] as PropType<AvatarSize>,
      default: undefined,
    },
    shape: {
      type: String as PropType<AvatarShape>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      cloneVNode(props.vnode, {
        ...(props.size !== undefined ? { size: props.size } : {}),
        ...(props.shape !== undefined ? { shape: props.shape } : {}),
        class: ['ex-avatar-group__item', props.vnode.props?.class],
      });
  },
});
