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
    class="flex flex-col items-center gap-3 mb-5 px-5 py-7 rounded-[50px] border-[10px]"
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

    <div class="flex flex-wrap">
      <div
        v-for="pawn in player.pawns"
        :key="pawn.id"
        class="w-1/2 p-2 relative"
      >
        <div
          :class="`absolute bg-${player.color}-100 border-${player.color}-400 border-2 rounded-full w-12 h-12 top-[50%] left-[50%] opacity-50 transform -translate-x-1/2 -translate-y-1/2 shadow-xl`"
        ></div>

        <PlayerPawn
          :pawn="pawn"
          :class="{
            'user-select-none opacity-0': pawn.position !== -1,
          }"
        />
      </div>
    </div>
  </div>
</template>
