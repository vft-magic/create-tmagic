<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue-demi';

import type { Id, MComponent } from '@tmagic/core';
import { useApp } from '@tmagic/vue-runtime-help';

interface ComponentSchema extends Omit<MComponent, 'id'> {
  id?: Id;
  type?: string;
  text: string;
}

export default defineComponent({
  props: {
    config: {
      type: Object as PropType<ComponentSchema>,
      required: true,
    },
    iteratorIndex: Array as PropType<number[]>,
    iteratorContainerId: Array as PropType<Id[]>,
    model: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    useApp({
      config: props.config,
      methods: {},
      iteratorContainerId: props.iteratorContainerId,
      iteratorIndex: props.iteratorIndex,
    });
  },
});
</script>
