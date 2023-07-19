<script setup>
import { computed } from "vue";
import { useLudoStore } from "../stores/ludo";
import BeefIcon from "./icons/BeefIcon.vue";

const ludoStore = useLudoStore();

const props = defineProps({
  pawn: {
    type: Object,
    required: true,
  },
  iconSize: {
    type: Number,
    default: 48,
  },
});

const isPlayerTurn = computed(() => {
  return ludoStore.isPlayerTurn(props.pawn.playerIndex);
});

const isPawnInHome = computed(() => {
  return props.pawn.position === -1;
});

const playerCurrentDiceValue = computed(() => {
  return ludoStore.getPlayerCurrentDiceValue(props.pawn.playerIndex);
});

const isDisabled = computed(() => {
  return (
    !isPlayerTurn.value ||
    (isPawnInHome.value && playerCurrentDiceValue.value !== 6) ||
    !ludoStore.isPlayerCanMove(props.pawn.playerIndex) ||
    !ludoStore.canMovePawnRelativeToItsDistanceTraveledValue(props.pawn) ||
    props.pawn.isArrived
  );
});

const pawnColor = computed(() => {
  return `text-${props.pawn.color}-600`;
});
</script>

<template>
  <div>
    <button
      class="flex justify-center w-full"
      :class="{
        'opacity-80': isDisabled,
        'relative animate-bounce hover:animate-none scale-125 cursor-pointer':
          !isDisabled,
      }"
      :disabled="isDisabled || pawn.isMoving"
      @click="async () => await ludoStore.movePawn(pawn)"
    >
      <BeefIcon :class="[pawnColor, 'drop-shadow-xl']" :width="iconSize" />
    </button>
  </div>
</template>
