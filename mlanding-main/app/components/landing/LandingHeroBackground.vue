<script setup lang="ts">
// Layered hero background: vertical wash, dot grid, aurora blobs, warm accent, spotlight.
</script>

<template>
  <div aria-hidden="true" class="absolute inset-0 -z-10 overflow-hidden">
    <!-- Vertical wash: sky → transparent so hero fades into page body -->
    <div class="absolute inset-0 bg-gradient-to-b from-secondary-50/70 via-white to-white dark:from-secondary-950/40 dark:via-black dark:to-black" />
    <!-- Subtle dot grid -->
    <div class="absolute inset-0 bg-[radial-gradient(#0002_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_75%)]" />
    <!-- Aurora: deep indigo behind the headline -->
    <div class="absolute -top-44 start-1/2 -translate-x-1/2 w-[min(56rem,120vw)] h-[min(36rem,80vw)] sm:h-[36rem] rounded-full bg-secondary-500 blur-[120px] opacity-[0.22] dark:opacity-[0.28]" />
    <!-- Cool accent: muted sky -->
    <div class="absolute top-24 end-[-10rem] w-[min(32rem,90vw)] h-[min(32rem,90vw)] rounded-full bg-sky-400 blur-[110px] opacity-15 dark:opacity-20 animate-blob" style="animation-delay:-3s" />
    <!-- Warm amber sliver for contrast (tiny, low opacity) -->
    <div class="absolute top-96 start-[-6rem] w-[min(28rem,90vw)] h-[min(28rem,90vw)] rounded-full bg-amber-300 blur-[110px] opacity-10 dark:opacity-[0.12] animate-blob" style="animation-delay:-6s" />
    <!-- Soft spotlight halo above the product stage -->
    <div class="absolute top-[36rem] start-1/2 -translate-x-1/2 w-[min(50rem,100vw)] h-[min(20rem,40vw)] sm:h-[20rem] rounded-[50%] bg-secondary-400 blur-[100px] opacity-[0.18] dark:opacity-25" />
  </div>
</template>
