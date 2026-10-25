<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ title: string; count?: number }>();
const emit = defineEmits<{ (e: "select", id: number): void }>();
const open = ref(false);
const label = computed(() => `${props.title} (${props.count ?? 0})`);
</script>

<template>
  <section :class="['card', { 'card--open': open }]" @click="open = !open">
    <h2 v-if="title">{{ label }}</h2>
    <slot name="footer" :open="open" />
    <button v-for="n in 3" :key="n" @click.stop="emit('select', n)">Pick {{ n }}</button>
  </section>
</template>

<style scoped>
.card--open {
  outline: 2px solid var(--color-brand);
}
</style>
