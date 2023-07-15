import { defineStore } from "pinia";

const WAY_LENGTH_PER_PAWN = 52;
const VICTORY_WAY_LENGTH = 6;
const TOTAL_WAY_LENGTH_PER_PAWN = WAY_LENGTH_PER_PAWN + VICTORY_WAY_LENGTH;

export const useLudoStore = defineStore("ludo", {
  state: () => ({
    // longeur de parcours par pion
    wayLengthPerPawn: WAY_LENGTH_PER_PAWN,
    // longeur chemin de victoire
    victoryWayLength: VICTORY_WAY_LENGTH,
    // total de cases avec chemin de victoire
    totalWayLengthPerPawn: TOTAL_WAY_LENGTH_PER_PAWN,
    // nombre de pions par joueur
    pawnsCountPerPlayer: 4,
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
    // id du joueur courant
    currentPlayerId: 0,
  }),
  actions: {
    // preparation du jeu

    init() {
      this.createPlayers();
      this.prepareBoard();
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

      console.log({ players: this.players });
    },

    createPlayer(index) {
      return {
        id: index,
        currentDiceValue: 0,
        wayStartIndex: null,
        wayEndIndex: null,
        victoryWayStartIndex: null,
        victoryWayEndIndex: null,
      };
    },

    createPawns(playerId) {
      const pawns = [];

      for (let index = 0; index < this.pawnsCountPerPlayer; index++) {
        pawns.push(this.createPawn(playerId, index));
      }

      return pawns;
    },

    createPawn(playerId, pawnId) {
      return {
        id: `${playerId}-${pawnId}`,
        playerId: playerId,
        position: -1,
        distanceTraveled: 0,
        isInVictoryWay: false,
      };
    },

    prepareBoard() {
      // creation des cases de parcours
      for (let index = 0; index < this.wayLengthPerPawn; index++) {
        const wayCase = this.createWayCase(index);
        this.board.push(wayCase);
      }

      // assignation des cases de parcours par joueur
      for (
        let playerIndex = 0;
        playerIndex < this.playersCount;
        playerIndex++
      ) {
        const distanceBetweenStartPoints =
          this.distanceBetweenStartPoints * playerIndex;
        const wayStartIndex = distanceBetweenStartPoints;

        let wayEndIndex = wayStartIndex - 2;

        if (wayEndIndex < 0) {
          wayEndIndex = this.wayLengthPerPawn - 2;
        }

        // calcul de l'index de debut et de fin du chemin de victoire
        const victoryWayStartIndex = wayEndIndex + 1;
        let victoryWayEndIndex = victoryWayStartIndex + this.victoryWayLength;

        if (victoryWayEndIndex > this.wayLengthPerPawn) {
          victoryWayEndIndex = victoryWayEndIndex - this.wayLengthPerPawn;
        }

        this.players[playerIndex].wayStartIndex = wayStartIndex;
        this.players[playerIndex].wayEndIndex = wayEndIndex;
        this.players[playerIndex].victoryWayStartIndex = victoryWayStartIndex;
        this.players[playerIndex].victoryWayEndIndex = victoryWayEndIndex;
      }
    },

    generatePlayerVictoryWayCases(player) {
      const victoryWayCases = [];

      for (let index = 0; index < this.victoryWayLength; index++) {
        const victoryWayCase = this.createVictoryWayCase(player.id, index);
        victoryWayCases.push(victoryWayCase);
      }

      return victoryWayCases;
    },

    createWayCase(index) {
      return {
        id: index,
        type: "way",
        pawnId: null,
      };
    },

    rollPlayerDice(playerId) {
      const player = this.players[playerId];
      const diceValue = this.getRandomDiceValue();

      player.currentDiceValue = diceValue;
      const pawnsOutsideHome = this.playerPawnsOutsideHome(playerId);

      if (diceValue === 6) {
        this.players[playerId].canMove = true;
      } else {
        if (pawnsOutsideHome.length === 0) {
          this.nextPlayer();
        } else if (pawnsOutsideHome.length === 1) {
          this.movePawn(pawnsOutsideHome[0]);
        } else {
          this.players[playerId].canMove = true;
        }
      }
    },

    getRandomDiceValue() {
      return Math.floor(Math.random() * 6) + 1;
    },

    movePawn(pawn) {
      const player = this.getPlayerByIndex(pawn.playerId);
      const diceValue = player.currentDiceValue;
      this.players[pawn.playerId].canMove = false;

      if (!diceValue) {
        console.log("no dice value");
        return;
      }

      if (pawn.position === -1) {
        if (diceValue === 6) {
          pawn.position = player.wayStartIndex;

          console.log(`pawn ${pawn.id} is out of home`);
        } else {
          console.log("Can't move pawn");
        }
      } else {
        pawn.distanceTraveled += diceValue;
        let nextPosition = +pawn.position + +diceValue;

        if (pawn.distanceTraveled > this.wayLengthPerPawn) {
          pawn.isInVictoryWay = true;
        }

        if (nextPosition > this.wayLengthPerPawn) {
          nextPosition = nextPosition - this.wayLengthPerPawn;
        }

        console.log(
          `pawn ${pawn.id} from ${
            pawn.position
          } to ${nextPosition} with dice value ${diceValue} | wayEndIndex : ${
            player.wayEndIndex
          } | isInVictoryWay : ${pawn.isInVictoryWay ? "yes" : "no"}
          | distanceTraveled : ${pawn.distanceTraveled}
          | totalWayLengthPerPawn : ${this.totalWayLengthPerPawn}
          | isPawnInVictoryWayAndCanMove : ${
            this.isPawnInVictoryWayAndCanMove(pawn) ? "yes" : "no"
          }
          `
        );

        pawn.position = nextPosition;
      }

      this.nextPlayer();
    },

    getPlayerByIndex(index) {
      return this.players[index];
    },

    nextPlayer() {
      let nextPlayerId = +this.currentPlayerId + 1;

      if (nextPlayerId >= this.playersCount) {
        nextPlayerId = 0;
      }

      this.currentPlayerId = nextPlayerId;
    },

    isPlayerTurn(playerId) {
      return this.currentPlayerId === playerId;
    },

    isPlayerCanMove(playerId) {
      return this.players[playerId].canMove;
    },

    playerCurrentDiceValue(playerId) {
      return this.players[playerId].currentDiceValue;
    },

    playerPawnsOutsideHome(playerId) {
      const player = this.players[playerId];
      return player.pawns.filter((pawn) => pawn.position !== -1);
    },

    isPawnInVictoryWayAndCanMove(pawn) {
      if (!pawn.isInVictoryWay) {
        return false;
      }

      console.log({
        pawn,
        totalWayLengthPerPawn: this.totalWayLengthPerPawn,
        distanceTraveled: pawn.distanceTraveled,
        totalWayLengthPerPawnMinusDistanceTraveled:
          this.totalWayLengthPerPawn - pawn.distanceTraveled,
        playerCurrentDiceValue: this.playerCurrentDiceValue(pawn.playerId),
      });

      if (
        this.totalWayLengthPerPawn - pawn.distanceTraveled <
        this.playerCurrentDiceValue(pawn.playerId)
      ) {
        return false;
      }

      return true;
    },

    getPlayerPawnsInBoardIndex(player, boardIndex) {
      return player.pawns.filter((pawn) => pawn.position === boardIndex);
    },
  },
});
