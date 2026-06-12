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
        v-if="breadcrumb && breadcrumb.length > 0"
        class="ex-page-header__breadcrumb"
        :aria-label="t('pageHeader.breadcrumb')"
      >
        <ol class="ex-page-header__breadcrumb-list">
          <li
            v-for="(item, index) in breadcrumb"
            :key="index"
            class="ex-page-header__breadcrumb-item"
          >
            <component
              :is="item.path ? 'button' : 'span'"
              class="ex-page-header__breadcrumb-link"
              :class="{
                'ex-page-header__breadcrumb-link--clickable': item.path,
                'ex-page-header__breadcrumb-link--current': index === breadcrumb.length - 1,
              }"
              :aria-current="index === breadcrumb.length - 1 ? 'page' : undefined"
              @click="item.path && handleBreadcrumbClick(item.path, index)"
            >
              {{ item.title }}
            </component>
            <span
              v-if="index < breadcrumb.length - 1"
              class="ex-page-header__breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>
          </li>
        </ol>
      </nav>

      <!-- 主要内容区 -->
      <div class="ex-page-header__main">
        <!-- 返回按钮 -->
        <button
          v-if="showBack"
          class="ex-page-header__back"
          type="button"
          :aria-label="backText || t('pageHeader.back')"
          @click="handleBack"
        >
          <ExIcon :name="backIcon || 'arrow-left'" class="ex-page-header__back-icon" />
          <span v-if="backText" class="ex-page-header__back-text">
            {{ backText }}
          </span>
        </button>

        <!-- 头像 -->
        <ExAvatar
          v-if="avatar"
          :src="avatar.src"
          :alt="avatar.alt"
          :size="avatar.size || 'medium'"
          class="ex-page-header__avatar"
        />

        <!-- 标题区域 -->
        <div class="ex-page-header__title-wrapper">
          <h1 v-if="title" class="ex-page-header__title">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="ex-page-header__subtitle">
            {{ subtitle }}
          </p>

          <!-- 标签 -->
          <div v-if="tags && tags.length > 0" class="ex-page-header__tags">
            <ExBadge
              v-for="(tag, index) in tags"
              :key="index"
              :type="
                (tag.type as 'default' | 'primary' | 'success' | 'warning' | 'danger') || 'default'
              "
              :style="tag.color ? { backgroundColor: tag.color } : undefined"
              class="ex-page-header__tag"
            >
              {{ tag.text }}
            </ExBadge>
          </div>
        </div>

        <!-- 操作区域插槽 -->
        <div v-if="$slots.extra" class="ex-page-header__extra">
          <slot name="extra" />
        </div>
      </div>

      <!-- 内容区域插槽 -->
      <div v-if="$slots.content" class="ex-page-header__content">
        <slot name="content" />
      </div>

      <!-- 底部区域插槽 -->
      <div v-if="$slots.footer" class="ex-page-header__footer">
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
import { ExBadge } from '../badge';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExPageHeader',
});

const { t } = useI18n();

const props = withDefaults(defineProps<PageHeaderProps>(), {
  showBack: false,
  showDivider: true,
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

// 处理返回按钮点击
const handleBack = () => {
  emit('back');
};

// 处理面包屑点击
const handleBreadcrumbClick = (path: string, index: number) => {
  emit('breadcrumb-click', path, index);
};
</script>
