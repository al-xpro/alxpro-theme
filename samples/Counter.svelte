<script lang="ts">
  let { start = 0, step = 1 }: { start?: number; step?: number } = $props();
  let count = $state(start);
  const doubled = $derived(count * 2);

  $effect(() => {
    document.title = `Count: ${count}`;
  });
</script>

<button onclick={() => (count += step)} class:big={count > 10}>
  Clicked {count} {count === 1 ? "time" : "times"}
</button>

{#if doubled > 20}
  <p>Doubled is {doubled}</p>
{:else}
  <p>Keep going</p>
{/if}

<style>
  .big {
    font-size: 2rem;
  }
</style>
