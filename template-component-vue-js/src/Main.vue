<template>
  <div></div>
</template>

<script setup>
import { useApp } from '@tmagic/vue-runtime-help';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
  iteratorIndex: Number,
  iteratorContainerId: Array,
  containerIndex: Number,
  pageFragmentContainerId?: Number,
  model: Object,
  disabled: Boolean,
});

useApp(props);
</script>
