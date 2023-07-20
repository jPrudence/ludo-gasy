<script setup>
import { useLudoStore } from "../stores/ludo";
import PlayerPawnsHome from "./PlayerPawnsHome.vue";
import GameBoardCell from "./GameBoardCell.vue";
import GameBoardCellVictory from "./GameBoardCellVictory.vue";

const ludoStore = useLudoStore();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-5"
    :class="{
      'opacity-20': ludoStore.isGameFinished,
    }"
  >
    <table class="my-3">
      <tbody>
        <tr class="font-bold">
          <GameBoardCell
            v-for="boardCell in ludoStore.board"
            :key="boardCell.id"
            :boardCell="boardCell"
          />
        </tr>
        <tr class="font-bold">
          <GameBoardCellVictory
            v-for="boardCell in ludoStore.board"
            :key="boardCell.id"
            :boardCell="boardCell"
          />
        </tr>
      </tbody>
    </table>

    <div class="flex gap-3 justify-around w-full">
      <PlayerPawnsHome
        v-for="player in ludoStore.players"
        :key="player.index"
        :player="player"
      />
    </div>
  </div>
</template>
<style scoped>
td {
  max-width: 55px;
}
</style>
