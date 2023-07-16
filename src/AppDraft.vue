<script setup>
import { useLudoStore } from "./stores/ludo";
import PlayerDice from "./components/PlayerDice.vue";
import PlayerPawnsHome from "./components/PlayerPawnsHome.vue";
import PlayerPawn from "./components/PlayerPawn.vue";

const ludoStore = useLudoStore();
ludoStore.setPlayersCount(2).setPawnCountPerPlayer(2).init();
</script>

<template>
  <div class="p-3 flex flex-col items-center justify-center gap-5">
    <div
      v-if="ludoStore.isGameFinished"
      class="flex items-center justify-center py-5"
    >
      <h1>Game is finished</h1>
      <h2>Winner is {{ ludoStore.playersRanking[0].name }}</h2>
    </div>

    <table>
      <tbody>
        <tr class="font-bold">
          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="border-2 border-gray-500 p-2"
          >
            <div
              v-if="boardItem.pawns.length"
              class="flex flex-col items-center justify-center"
            >
              <div v-for="pawn in boardItem.pawns" :key="pawn.id">
                <span
                  v-if="!pawn.isInVictoryWay"
                  :class="[`text-${pawn.color}-400`]"
                >
                  <PlayerPawn :pawn="pawn" :iconSize="25" />
                </span>
              </div>
            </div>
            <div v-else>--</div>
          </td>
        </tr>

        <tr v-for="player in ludoStore.players" :key="player.index">
          <td
            v-for="boardItem in ludoStore.board"
            :key="boardItem.id"
            class="border-2 p-2"
            :class="[
              boardItem.id != player.victoryWayEndIndex - 1 &&
                `bg-${player.color}-400`,
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

    <div
      v-for="player in ludoStore.players"
      :key="player.index"
      class="flex flex-col items-center justify-center gap-3 mb-5"
      :class="{
        'border-2 border-green-500':
          player.index === ludoStore.currentPlayerIndex,
      }"
    >
      <PlayerDice :player="player" />
      <PlayerPawnsHome :player="player" />

      <table>
        <tbody>
          <tr>
            <td
              v-for="boardI in ludoStore.wayLengthPerPawn + 1"
              :key="boardI"
              class="border-2 border-gray-500 p-2"
            >
              <div class="flex flex-col items-center justify-center">
                <div
                  v-for="pawn in ludoStore.getPlayerPawnsInBoardIndex(
                    player,
                    boardI - 1
                  )"
                  :key="pawn.id"
                  :class="{
                    'font-bold': pawn.isInVictoryWay,
                    'text-red-500': pawn.isInVictoryWay && !pawn.isArrived,
                    'text-green-500': pawn.isArrived,
                  }"
                >
                  {{ pawn.id }}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              v-for="boardI in ludoStore.wayLengthPerPawn + 1"
              :key="boardI"
              class="border-2 px-2"
              :class="{
                'border-green-500 border-4': player.wayStartIndex == boardI - 1,
                'border-blue-500 border-4': player.wayEndIndex == boardI - 1,
                'border-gray-500':
                  player.wayStartIndex != boardI - 1 &&
                  player.wayEndIndex != boardI - 1,
              }"
            >
              {{ boardI - 1 }}
            </td>
          </tr>
          <tr>
            <td
              v-for="boardI in ludoStore.wayLengthPerPawn + 1"
              :key="boardI"
              class="px-2"
              :class="{
                'bg-red-500 border-2 border-red-500':
                  player.victoryWayIndexes.includes(boardI - 1),
              }"
            >
              <template v-if="player.victoryWayIndexes.includes(boardI - 1)">{{
                boardI - 1
              }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="tw-class">
      <span class="bg-red-400 text-red-400"></span>
      <span class="bg-blue-400 text-blue-400"></span>
      <span class="bg-green-400 text-green-400"></span>
      <span class="bg-yellow-400 text-yellow-400"></span>
    </div>
  </div>
</template>
