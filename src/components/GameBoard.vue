<script setup>
import { useLudoStore } from "../stores/ludo";
import PlayerPawn from "./PlayerPawn.vue";
import PlayerPawnsHome from "./PlayerPawnsHome.vue";
import { mdiArrowRightThinCircleOutline } from "@mdi/js";

const ludoStore = useLudoStore();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-5">
    <table class="my-3">
      <tbody>
        <tr class="font-bold">
          <td class="px-2">
            <SvgIcon
              type="mdi"
              :path="mdiArrowRightThinCircleOutline"
              size="20"
            />
          </td>

          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="border-2 border-gray-500 p-2 relative"
          >
            <span
              class="text-gray-300 text-xs absolute -top-5 left-0 w-full text-center"
              >{{ boardItem.id }}</span
            >
            <div
              v-if="boardItem.pawns.length"
              class="flex flex-col items-center justify-center"
            >
              <div v-for="pawn in boardItem.pawns" :key="pawn.id">
                <span v-if="!pawn.isInVictoryWay">
                  <PlayerPawn :pawn="pawn" :iconSize="25" />
                </span>
              </div>
            </div>
            <div v-else>--</div>
          </td>
        </tr>

        <tr v-for="player in ludoStore.players" :key="player.index">
          <td></td>
          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="border-2 p-2"
            :class="[
              boardItem.id != player.victoryWayEndIndex - 1 &&
                `border-${player.color}-400`,
              boardItem.id == player.victoryWayEndIndex - 1 &&
                'border-green-500 border-4',
            ]"
          >
            <div
              v-if="boardItem.pawns.length"
              class="flex flex-col items-center justify-center"
            >
              <template v-for="pawn in boardItem.pawns" :key="pawn.id">
                <div
                  v-if="pawn.playerIndex == player.index && pawn.isInVictoryWay"
                  :class="{
                    'font-bold': pawn.isInVictoryWay,
                    'text-green-500': pawn.isArrived,
                  }"
                >
                  <PlayerPawn :pawn="pawn" :iconSize="20" />
                </div>
              </template>
            </div>
            <div v-else>--</div>
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

    <div class="tw-class">
      <span class="bg-red-400 text-red-400 border-red-400"></span>
      <span class="bg-blue-400 text-blue-400 border-blue-400"></span>
      <span class="bg-green-400 text-green-400 border-green-400"></span>
      <span class="bg-yellow-400 text-yellow-400 border-yellow-400"></span>
    </div>
  </div>
</template>
