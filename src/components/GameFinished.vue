<script setup>
import { useLudoStore } from "../stores/ludo";
const ludoStore = useLudoStore();
</script>

<template>
  <div
    v-if="ludoStore.isGameFinished"
    class="flex flex-col items-center justify-center py-5"
  >
    <h1 class="text-3xl font-bold text-center text-green-600 mb-3">
      Tapitra ny lalao !
    </h1>

    <h2 class="text-2xl font-bold text-center text-gray-700">
      Ny mpandesy dia i
      <i class="text-3xl text-green-600">{{
        ludoStore.playersRanking[0].name
      }}</i>
    </h2>
  </div>
</template>
