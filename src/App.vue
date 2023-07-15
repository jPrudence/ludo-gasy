<script setup>
import { useLudoStore } from "./stores/ludo";
import PlayerDice from "./components/PlayerDice.vue";
import PlayerPawnsHome from "./components/PlayerPawnsHome.vue";

const ludoStore = useLudoStore();

ludoStore.setPlayersCount(1).init();
</script>

<template>
  <div>
    <div class="grsid grid-cols-2 gap-3">
      <div
        v-for="player in ludoStore.players"
        :key="player.id"
        class="flex flex-col items-center justify-center gap-3 mb-5"
        :class="{
          'bordesr-2 border-rsed-500': player.id === ludoStore.currentPlayerId,
        }"
      >
        <PlayerDice :player="player" />
        <PlayerPawnsHome :player="player" />

        <table>
          <tbody>
            <tr>
              <td
                v-for="boardI in ludoStore.wayLengthPerPawn"
                :key="boardI"
                class="border-2 border-red-500 px-2"
              >
                <div class="flex">
                  <div
                    v-for="pawn in ludoStore.getPlayerPawnsInBoardIndex(
                      player,
                      boardI
                    )"
                    :key="pawn.id"
                  >
                    {{ pawn.id }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td
                v-for="boardI in ludoStore.wayLengthPerPawn"
                :key="boardI"
                class="border-2 border-red-500 px-2"
                :class="{
                  'bg-red-500':
                    bordI >= player.victoryWayStartIndex &&
                    boardI <= player.victoryWayEndIndex,
                }"
              >
                {{ boardI }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
