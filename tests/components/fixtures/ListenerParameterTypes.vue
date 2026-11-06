<template>
  <ExCard
    @click="event => expectTypeOf(event).toEqualTypeOf<MouseEvent>()"
    @click.once="event => expectTypeOf(event).toEqualTypeOf<MouseEvent>()"
  >
    卡片
  </ExCard>
  <ExNotification
    :duration="0"
    @click="(...args) => expectTypeOf(args).toEqualTypeOf<[]>()"
    @click.once="(...args) => expectTypeOf(args).toEqualTypeOf<[]>()"
  >
    通知
  </ExNotification>
</template>

<script setup lang="ts">
import { expectTypeOf } from 'vitest';
import ExCard from '../../../src/components/card/ExCard.vue';
import ExNotification from '../../../src/components/notification/ExNotification.vue';
</script>
