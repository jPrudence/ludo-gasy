<script setup>
import GameBoard from "./components/GameBoard.vue";
import GameFinished from "./components/GameFinished.vue";
import GameConfig from "./components/GameConfig.vue";
</script>

<template>
  <div class="p-3 flex flex-col items-center justify-center gap-5">
    <GameConfig />

    <GameFinished />

    <GameBoard />
  </div>
</template>
