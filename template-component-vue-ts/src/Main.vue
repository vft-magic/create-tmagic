<template>
  <div></div>
</template>

<script lang="ts" setup>
import type { Id, MComponent } from '@tmagic/core';
import { type ComponentProps, useApp } from '@tmagic/vue-runtime-help';

export interface ComponentSchema extends Omit<MComponent, 'id'> {
  id?: Id;
  type?: string;
  text: string;
}

const props = defineProps<ComponentProps<ComponentSchema>>();

useApp(props);
</script>
