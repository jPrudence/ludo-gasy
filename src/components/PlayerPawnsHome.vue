<script setup>
import { useLudoStore } from "../stores/ludo";
import PlayerPawn from "./PlayerPawn.vue";
import PlayerDice from "./PlayerDice.vue";

const ludoStore = useLudoStore();

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 mb-5 p-5 rounded-xl border-4"
    :class="
      player.index === ludoStore.currentPlayerIndex &&
      `border-${player.color}-600`
    "
  >
    <h2
      class="text-2xl font-bold text-center"
      :class="`text-${player.color}-500`"
    >
      {{ player.name }}
    </h2>

    <PlayerDice :player="player" />

    <div class="flex items-center justify-center gap-3">
      <div v-for="pawn in player.pawns" :key="pawn.id">
        <PlayerPawn v-if="pawn.position === -1" :pawn="pawn" />
      </div>
    </div>
  </div>
</template>
