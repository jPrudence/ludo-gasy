<script setup>
import { useLudoStore } from "./stores/ludo";
import GameBoard from "./components/GameBoard.vue";
const ludoStore = useLudoStore();

const newGame = () => {
  ludoStore.setPlayersCount(2).init();
};

newGame();
</script>

<template>
  <div class="p-3 flex flex-col items-center justify-center gap-5">
    <div
      v-if="ludoStore.isGameFinished"
      class="flex items-center justify-center py-5"
    >
      <h1>Game is finished</h1>
      <h2>Winner is {{ ludoStore.playersRanking[0].name }}</h2>
    </div>

    <GameBoard />
  </div>
</template>
