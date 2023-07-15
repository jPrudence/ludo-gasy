<script setup>
import { useLudoStore } from "./stores/ludo";
const ludoStore = useLudoStore();

ludoStore.setPlayersCount(2).init();
</script>

<template>
  <div>Hello!</div>
</template>
