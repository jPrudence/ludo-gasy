<script setup>
import { computed } from "vue";
import { useLudoStore } from "../stores/ludo";
import { mdiRadioactiveCircleOutline } from "@mdi/js";

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
  return `text-${props.pawn.color}-400`;
});
</script>

<template>
  <div>
    <button
      class="flex flex-col items-center justify-center gap-3"
      :class="{
        'opacity-80 scale-75 cursor-no-drop': isDisabled,
        'relative animate-bounce hover:animate-none scale-125 cursor-pointer':
          !isDisabled,
      }"
      :disabled="isDisabled"
      @click="ludoStore.movePawn(pawn)"
    >
      <SvgIcon
        :class="pawnColor"
        type="mdi"
        :path="mdiRadioactiveCircleOutline"
        :size="iconSize"
      />
    </button>
  </div>
</template>
