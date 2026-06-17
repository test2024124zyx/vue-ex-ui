<template>
  <header
    class="ex-page-header"
    :class="{
      'ex-page-header--fixed': fixed,
      'ex-page-header--with-divider': showDivider,
    }"
    :style="headerStyle"
  >
    <div class="ex-page-header__container">
      <!-- 面包屑导航 -->
      <nav
        v-if="$slots.breadcrumb || (breadcrumb && breadcrumb.length > 0)"
        class="ex-page-header__breadcrumb"
        :aria-label="t('pageHeader.breadcrumb')"
      >
        <slot name="breadcrumb">
          <ol class="ex-page-header__breadcrumb-list">
            <li
              v-for="(item, index) in breadcrumb"
              :key="index"
              class="ex-page-header__breadcrumb-item"
            >
              <component
                :is="item.path ? 'button' : 'span'"
                :type="item.path ? 'button' : undefined"
                class="ex-page-header__breadcrumb-link"
                :class="{
                  'ex-page-header__breadcrumb-link--clickable': item.path,
                  'ex-page-header__breadcrumb-link--current': index === breadcrumb!.length - 1,
                }"
                :aria-current="index === breadcrumb!.length - 1 ? 'page' : undefined"
                @click="item.path && handleBreadcrumbClick(item.path, index)"
              >
                {{ item.title }}
              </component>
              <span
                v-if="index < breadcrumb!.length - 1"
                class="ex-page-header__breadcrumb-separator"
                aria-hidden="true"
              >
                /
              </span>
            </li>
          </ol>
        </slot>
      </nav>

      <!-- 主要内容区 -->
      <div class="ex-page-header__main">
        <!-- 返回按钮 -->
        <slot name="back">
          <button
            v-if="showBack"
            class="ex-page-header__back"
            type="button"
            :aria-label="backText || t('pageHeader.back')"
            @click="handleBack"
          >
            <ExIcon
              :icon="backIcon || 'arrow-left-s-line'"
              :size="18"
              class="ex-page-header__back-icon"
              aria-hidden="true"
            />
            <span
              v-if="backText"
              class="ex-page-header__back-text"
            >
              {{ backText }}
            </span>
          </button>
        </slot>

        <!-- 头像 -->
        <slot name="avatar">
          <ExAvatar
            v-if="avatar"
            :src="avatar.src"
            :alt="avatar.alt"
            :size="avatar.size || 'medium'"
            class="ex-page-header__avatar"
          />
        </slot>

        <!-- 标题区域 -->
        <div class="ex-page-header__title-wrapper">
          <h1
            v-if="title || $slots.title"
            class="ex-page-header__title"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </h1>
          <p
            v-if="subtitle || $slots.subtitle"
            class="ex-page-header__subtitle"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </p>

          <!-- 标签 -->
          <div
            v-if="$slots.tags || (tags && tags.length > 0)"
            class="ex-page-header__tags"
          >
            <slot name="tags">
              <ExTag
                v-for="(tag, index) in tags"
                :key="index"
                :type="resolveTagType(tag.type)"
                :bg-color="tag.color"
                size="small"
                class="ex-page-header__tag"
              >
                {{ tag.text }}
              </ExTag>
            </slot>
          </div>
        </div>

        <!-- 操作区域插槽 -->
        <div
          v-if="$slots.extra"
          class="ex-page-header__extra"
        >
          <slot name="extra" />
        </div>
      </div>

      <!-- 内容区域（默认插槽） -->
      <div
        v-if="$slots.default"
        class="ex-page-header__content"
      >
        <slot />
      </div>

      <!-- 底部区域插槽 -->
      <div
        v-if="$slots.footer"
        class="ex-page-header__footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PageHeaderProps, PageHeaderEmits } from './types';
import { ExIcon } from '../icon';
import { ExAvatar } from '../avatar';
import { ExTag } from '../tag';
import type { TagType } from '../tag/types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExPageHeader',
});

const { t } = useI18n();

const props = withDefaults(defineProps<PageHeaderProps>(), {
  title: undefined,
  subtitle: undefined,
  backText: undefined,
  backIcon: undefined,
  showBack: false,
  breadcrumb: undefined,
  tags: undefined,
  avatar: undefined,
  showDivider: true,
  height: undefined,
  fixed: false,
  zIndex: 1000,
});

const emit = defineEmits<PageHeaderEmits>();

// 头部样式
const headerStyle = computed(() => {
  const style: Record<string, string | number> = {};
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  if (props.fixed) {
    style.zIndex = props.zIndex;
  }
  return style;
});

// 将 PageHeader 的 tag.type（含遗留 default/error）映射到 ExTag 的 TagType
const resolveTagType = (type?: string): TagType | undefined => {
  if (!type || type === 'default') return undefined;
  if (type === 'error') return 'danger';
  return type as TagType;
};

const handleBack = () => {
  emit('back');
};

const handleBreadcrumbClick = (path: string, index: number) => {
  emit('breadcrumb-click', path, index);
};
</script>

<style scoped lang="scss" src="./ExPageHeader.scss"></style>
