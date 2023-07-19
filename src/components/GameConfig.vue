<script setup>
import { ref } from "vue";
import { useLudoStore } from "../stores/ludo";
const ludoStore = useLudoStore();

const playersCount = ref(ludoStore.playersCount);

const newGame = () => {
  ludoStore.setPlayersCount(playersCount.value).init();
};

const canStartNewGame = () => {
  return (
    (ludoStore.isGameFinished &&
      playersCount.value >= 2 &&
      playersCount.value <= 4) ||
    playersCount.value !== ludoStore.playersCount
  );
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-xl border-4 p-5"
  >
    <div class="flex flex-col items-center justify-center gap-3 mb-5">
      <label
        for="playersCount"
        class="text-lg font-bold text-center text-gray-600"
      >
        Isan'ny mpilalao
      </label>

      <input
        v-model="playersCount"
        min="2"
        max="4"
        id="playersCount"
        type="number"
        class="border-2 border-gray-300 p-2 rounded-lg w-20 text-center font-semibold"
        placeholder="Players count"
      />
    </div>

    <button
      class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4 transition-all duration-150"
      :class="{
        'opacity-50 hover:opacity-100': !canStartNewGame(),
      }"
      @click="newGame"
    >
      Anomboka lalao vaovao
    </button>
  </div>
</template>
