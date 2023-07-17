<script setup>
import { computed } from "vue";
import { useLudoStore } from "../stores/ludo";
import {
  mdiDiceMultipleOutline,
  mdiDice1Outline,
  mdiDice2Outline,
  mdiDice3Outline,
  mdiDice4Outline,
  mdiDice5Outline,
  mdiDice6Outline,
} from "@mdi/js";

const ludoStore = useLudoStore();

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
});

const diceIcons = {
  0: mdiDiceMultipleOutline,
  1: mdiDice1Outline,
  2: mdiDice2Outline,
  3: mdiDice3Outline,
  4: mdiDice4Outline,
  5: mdiDice5Outline,
  6: mdiDice6Outline,
};

const isPlayerTurn = computed(() => {
  return ludoStore.isPlayerTurn(props.player.index);
});

const isPlayerCanMove = computed(() => {
  return ludoStore.isPlayerCanMove(props.player.index);
});

const isDisabled = computed(() => {
  return (
    !isPlayerTurn.value ||
    (isPlayerTurn.value && isPlayerCanMove.value) ||
    ludoStore.isGameFinished
  );
});
</script>

<template>
  <div>
    <button
      :class="{
        'opacity-20 cursor-no-drop': isDisabled,
        'animate-ping hover:animate-none cursor-pointer': !isDisabled,
      }"
      :disabled="isDisabled"
      @click="ludoStore.rollPlayerDice(player.index)"
    >
      <SvgIcon
        type="mdi"
        :path="diceIcons[player.currentDiceValue]"
        :size="48"
      />
    </button>
  </div>
</template>
