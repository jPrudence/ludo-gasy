<script setup>
import { useLudoStore } from "../stores/ludo";
import PlayerPawn from "./PlayerPawn.vue";
import PlayerPawnsHome from "./PlayerPawnsHome.vue";
import { mdiArrowRightThinCircleOutline } from "@mdi/js";

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
          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="border-2 border-gray-600 p-1 relative"
            :class="[
              !boardItem.pawns.length && 'p-4',
              boardItem.cellStartOf && `bg-${boardItem.cellStartOf.color}-100`,
            ]"
          >
            <span
              class="select-none text-gray-300 text-xs absolute -top-5 left-0 w-full text-center"
              >{{ boardItem.id }}</span
            >

            <div
              v-if="boardItem.cellEndOf"
              class="text-gray-600 absolute top-0 left-0 w-full h-full flex justify-center items-center transform rotate-45"
              :class="[boardItem.pawns.length ? 'opacity-10' : 'opacity-70']"
            >
              <SvgIcon
                type="mdi"
                size="20"
                :path="mdiArrowRightThinCircleOutline"
              />
            </div>

            <div
              v-if="boardItem.cellStartOf"
              class="opacity-70 text-gray-600 absolute top-0 left-0 w-full h-full flex justify-center items-center"
              :class="[boardItem.pawns.length ? 'opacity-10' : 'opacity-70']"
            >
              <SvgIcon
                type="mdi"
                size="20"
                :path="mdiArrowRightThinCircleOutline"
              />
            </div>

            <div
              v-if="boardItem.pawns.length"
              class="flex flex-wrap justify-center"
            >
              <div
                v-for="pawn in boardItem.pawns"
                :key="pawn.id"
                :class="[boardItem.pawns.length <= 2 ? 'w-full' : 'w-1/2']"
              >
                <PlayerPawn
                  v-if="!pawn.isInVictoryCell"
                  :pawn="pawn"
                  :iconSize="boardItem.pawns.length > 1 ? 20 : 30"
                />
              </div>
            </div>
          </td>
        </tr>
        <tr class="font-bold">
          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="p-1"
            :class="[
              (!boardItem.victoryCellOf ||
                boardItem.id !==
                  boardItem.victoryCellOf.victoryCellEndIndex - 1) &&
                'border-gray-600 border-2',
              boardItem.victoryCellOf &&
                `bg-${boardItem.victoryCellOf.color}-100`,
              boardItem.victoryCellOf &&
                boardItem.id ==
                  boardItem.victoryCellOf.victoryCellEndIndex - 1 &&
                `border-${boardItem.victoryCellOf.color}-600 border-4`,
              !boardItem.pawns.length && 'p-4',
            ]"
          >
            <div
              v-if="boardItem.pawns.length"
              class="flex flex-wrap justify-center"
            >
              <div
                v-for="pawn in boardItem.pawns"
                :key="pawn.id"
                :class="[boardItem.pawns.length <= 2 ? 'w-full' : 'w-1/2']"
              >
                <PlayerPawn
                  v-if="pawn.isInVictoryCell"
                  :pawn="pawn"
                  :iconSize="boardItem.pawns.length > 1 ? 20 : 30"
                />
              </div>
            </div>
          </td>
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
