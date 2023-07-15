<script setup>
import { computed } from "vue";
import { useLudoStore } from "../stores/ludo";
import { mdiCar } from "@mdi/js";

const ludoStore = useLudoStore();

const props = defineProps({
  pawn: {
    type: Object,
    required: true,
  },
});

const isPlayerTurn = computed(() => {
  return ludoStore.isPlayerTurn(props.pawn.playerId);
});

const isPawnInHome = computed(() => {
  return props.pawn.position === -1;
});

const playerCurrentDiceValue = computed(() => {
  return ludoStore.playerCurrentDiceValue(props.pawn.playerId);
});

const isDisabled = computed(() => {
  return (
    !isPlayerTurn.value ||
    (isPawnInHome.value && playerCurrentDiceValue.value !== 6) ||
    !ludoStore.isPlayerCanMove(props.pawn.playerId)
  );
});
</script>

<template>
  <div>
    <button
      class="flex flex-col items-center justify-center gap-3"
      :class="{
        'opacity-50': isDisabled,
      }"
      :disabled="isDisabled"
      @click="ludoStore.movePawn(pawn)"
    >
      <SvgIcon type="mdi" :path="mdiCar" :size="48" />
      <p>Position : {{ pawn.position }}</p>
    </button>
  </div>
</template>
