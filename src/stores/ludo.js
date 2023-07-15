import { defineStore } from "pinia";

export const useLudoStore = defineStore("ludo", {
  state: () => ({
    // longeur de parcours par joueur
    wayLengthPerPlayer: 56,
    // nombre de pions par joueur
    pawnsPerPlayer: 4,
    // nombre de joueurs
    playersCount: 4,
    // nombre de cases distance entre les points de départ de 2 joueurs
    distanceBetweenStartPoints: 13,
    // tableau des joueurs
    players: [],
    // tableau des cases
    board: [],
    // valeur du dé
    diceValue: 0,
    // index du joueur courant
    currentPlayerIndex: 0,
  }),
  actions: {
    // preparation du jeu

    init() {
      this.createPlayers();
    },

    setPlayersCount(count) {
      this.playersCount = count;
      return this;
    },

    createPlayers() {
      console.log({
        playersCount: this.playersCount,
      });

      for (let index = 0; index < this.playersCount; index++) {
        const player = this.createPlayer(index);
        player.pawns = this.createPawns(player.id);
        this.players.push(player);
      }

      console.log(this.players);
    },

    createPlayer(index) {
      return {
        id: index,
      };
    },

    createPawns(playerId) {
      const pawns = [];

      for (let index = 0; index < this.pawnsPerPlayer; index++) {
        pawns.push(this.createPawn(playerId, index));
      }

      return pawns;
    },

    createPawn(playerId, pawnId) {
      return {
        id: pawnId,
        playerId: playerId,
        position: 0,
      };
    },
  },
});
