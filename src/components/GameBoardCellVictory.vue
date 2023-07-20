<script setup>
import PlayerPawn from "./PlayerPawn.vue";

const props = defineProps({
  boardCell: {
    type: Object,
    required: true,
  },
  elementType: {
    type: String,
    default: "td",
  },
});
</script>

<template>
  <component
    :is="elementType"
    class="p-1"
    :class="[
      (!boardCell.victoryCellOf ||
        boardCell.id !== boardCell.victoryCellOf.victoryCellEndIndex) &&
        'border-gray-600 border-2',
      boardCell.victoryCellOf && `bg-${boardCell.victoryCellOf.color}-100`,
      boardCell.victoryCellOf &&
        boardCell.id == boardCell.victoryCellOf.victoryCellEndIndex &&
        `border-${boardCell.victoryCellOf.color}-600 border-4`,
      !boardCell.pawns.length && 'p-4',
    ]"
  >
    <div v-if="boardCell.pawns.length" class="flex flex-wrap justify-center">
      <div
        v-for="pawn in boardCell.pawns"
        :key="pawn.id"
        :class="[boardCell.pawns.length <= 2 ? 'w-full' : 'w-1/2']"
      >
        <PlayerPawn
          v-if="pawn.isInVictoryCell"
          :pawn="pawn"
          :iconSize="boardCell.pawns.length > 1 ? 20 : 30"
        />
      </div>
    </div>
  </component>
</template>
