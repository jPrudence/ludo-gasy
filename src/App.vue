<script setup>
import { useLudoStore } from "./stores/ludo";
import PlayerDice from "./components/PlayerDice.vue";
import PlayerPawnsHome from "./components/PlayerPawnsHome.vue";

const ludoStore = useLudoStore();

ludoStore.setPlayersCount(1).setPawnCountPerPlayer(1).init();
</script>

<template>
  <div>
    <div
      v-if="ludoStore.isGameFinished"
      class="flex items-center justify-center py-5"
    >
      <h1>Game is finished</h1>
      <h2>Winner is {{ ludoStore.playersRanking[0].name }}</h2>
    </div>
    <div>
      <div
        v-for="player in ludoStore.players"
        :key="player.index"
        class="flex flex-col items-center justify-center gap-3 mb-5"
        :class="{
          'bordesr-2 border-rsed-500':
            player.index === ludoStore.currentPlayerId,
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
                class="border-2 border-red-500 p-2"
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
                class="border-2 border-red-500 px-2"
                :class="{
                  'border-green-500 border-4':
                    player.wayStartIndex == boardI - 1,
                  'border-orange-500 border-4':
                    player.wayEndIndex == boardI - 1,
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
                <template
                  v-if="player.victoryWayIndexes.includes(boardI - 1)"
                  >{{ boardI - 1 }}</template
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
