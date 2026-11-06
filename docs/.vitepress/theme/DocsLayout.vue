<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import ThemeSwitcher from './ThemeSwitcher.vue';

const DefaultLayout = DefaultTheme.Layout;
</script>

<template>
  <DefaultLayout>
    <template #nav-bar-content-after>
      <ThemeSwitcher />
    </template>
  </DefaultLayout>
</template>
