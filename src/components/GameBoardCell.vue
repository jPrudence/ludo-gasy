<script setup>
import { computed } from "vue";
import PlayerPawn from "./PlayerPawn.vue";
import { mdiArrowRightThinCircleOutline, mdiStar } from "@mdi/js";

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

const pawnsNotInVictoryCell = computed(() => {
  return props.boardCell.pawns.filter((pawn) => !pawn.isInVictoryCell);
});

const pawnsNotMoving = computed(() => {
  return pawnsNotInVictoryCell.value.filter((pawn) => !pawn.isMoving);
});

const cellIconClass =
  "text-gray-600 absolute top-0 left-0 w-full h-full flex justify-center items-center";
</script>

<template>
  <component
    :is="elementType"
    class="border-2 border-gray-600 p-1 relative min-w-[34px] max-w-[55px]"
    :class="[
      !boardCell.pawns.length && 'p-4',
      boardCell.cellStartOf && `bg-${boardCell.cellStartOf.color}-100`,
    ]"
  >
    <span
      class="select-none text-gray-300 text-xs absolute -top-5 left-0 w-full text-center"
    >
      {{ boardCell.id }}
    </span>

    <div
      v-if="boardCell.cellEndOf"
      class="transform rotate-45"
      :class="[
        cellIconClass,
        pawnsNotInVictoryCell.length ? 'opacity-10' : 'opacity-70',
      ]"
    >
      <SvgIcon type="mdi" size="20" :path="mdiArrowRightThinCircleOutline" />
    </div>

    <div
      v-if="boardCell.hasMovingShadowOf"
      class="absolute top-2 left-0"
      :class="[
        `p-3 rounded-full filter blur-[7px] opacity-20 bg-${boardCell.hasMovingShadowOf.color}-500 transform`,
        boardCell.hasMovingShadowOf.movingShadowIndex === 0 && ' scale-[0.8]',
        boardCell.hasMovingShadowOf.movingShadowIndex === 1 && ' scale-[0.7]',
        boardCell.hasMovingShadowOf.movingShadowIndex === 2 && ' scale-[0.6]',
      ]"
    ></div>

    <div
      v-if="boardCell.isSafe"
      :class="[
        cellIconClass,
        pawnsNotInVictoryCell.length ? 'opacity-40' : 'opacity-70',
      ]"
    >
      <SvgIcon type="mdi" size="25" :path="mdiStar" />
    </div>

    <div
      v-if="pawnsNotInVictoryCell.length"
      class="flex flex-wrap justify-center relative min-h-[30px]"
    >
      <div
        v-for="pawn in pawnsNotInVictoryCell"
        :key="pawn.id"
        :class="[
          pawn.isMoving || pawnsNotMoving.length <= 2 ? 'w-full' : 'w-1/2',
          pawn.isMoving && 'absolute top-0 mx-auto z-2',
          !pawn.isMoving && 'z-1',
        ]"
      >
        <PlayerPawn
          :pawn="pawn"
          :iconSize="!pawn.isMoving && pawnsNotMoving.length > 1 ? 20 : 30"
        />
      </div>
    </div>
  </component>
</template>
