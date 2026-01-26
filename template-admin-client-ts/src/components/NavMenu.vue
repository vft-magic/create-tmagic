<template>
  <div class="m-editor-nav-menu">
    <TMagicButton
      v-for="(item, index) in data"
      class="menu-item button"
      :key="index"
      size="small"
      link
      @click="item.handler"
    >
      <TMagicIcon><component :is="item.icon"></component></TMagicIcon><span>{{ item.text }}</span>
    </TMagicButton>
  </div>
</template>

<script lang="ts" setup>
import { type MenuButton, TMagicButton, TMagicIcon } from '@tmagic/editor';

defineOptions({
  name: 'nav-menu',
});

defineProps<{
  data: MenuButton[];
}>();
</script>

<style lang="scss" scoped>
.m-editor-nav-menu {
  justify-content: flex-end;
  height: 35px;
}
</style>
