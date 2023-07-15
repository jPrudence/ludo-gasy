<script setup>
import { useLudoStore } from "../stores/ludo";
import PlayerPawn from "./PlayerPawn.vue";
const ludoStore = useLudoStore();

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>
    <div class="flex items-center justify-center gap-3">
      <div v-for="pawn in player.pawns" :key="pawn.id">
        <PlayerPawn :pawn="pawn" />
      </div>
    </div>
  </div>
</template>
