import { defineStore } from "pinia";

const WAY_LENGTH_PER_PAWN = 51; // counted from 0
const VICTORY_WAY_LENGTH = 6;
const TOTAL_WAY_LENGTH_PER_PAWN = WAY_LENGTH_PER_PAWN + VICTORY_WAY_LENGTH - 1; // -1 : because 0 is counted
const DISTANCE_BETWEEN_START_POINTS = 52 / 4; // 4 : nombre de base de joueurs

export const useLudoStore = defineStore("ludo", {
  state: () => ({
    // longeur de parcours par pion
    wayLengthPerPawn: WAY_LENGTH_PER_PAWN,
    // longeur chemin de victoire
    victoryWayLength: VICTORY_WAY_LENGTH,
    // total de cases avec chemin de victoire
    totalWayLengthPerPawn: TOTAL_WAY_LENGTH_PER_PAWN,
    // nombre de cases distance entre les points de départ de 2 joueurs
    distanceBetweenStartPoints: DISTANCE_BETWEEN_START_POINTS,
    // nombre de pions par joueur
    pawnsCountPerPlayer: 4,
    // nombre de joueurs
    playersCount: 4,
    // tableau des joueurs
    players: [],
    // tableau des cases
    board: [],
    // valeur du dé
    diceValue: 0,
    // index du joueur courant
    currentPlayerIndex: 0,
    // etat du jeu
    isGameFinished: false,
    // classement des joueurs
    playersRanking: [],
  }),
  actions: {
    // preparation du jeu

    init() {
      this.gameIsFinished = false;
      this.playersRanking = [];

      this.createPlayers();

      this.prepareBoard();
    },

    setPlayersCount(count) {
      this.playersCount = count;
      return this;
    },

    setPawnCountPerPlayer(count) {
      this.pawnsCountPerPlayer = count;
      return this;
    },

    createPlayers() {
      console.log({
        playersCount: this.playersCount,
      });

      for (let index = 0; index < this.playersCount; index++) {
        const player = this.createPlayer(index);
        player.pawns = this.createPawns(player.index);
        this.players.push(player);
      }

      console.log({ players: this.players });
    },

    createPlayer(index) {
      return {
        index,
        name: `Player ${index + 1}`,
        currentDiceValue: 0,
        wayStartIndex: null,
        wayEndIndex: null,
        victoryWayStartIndex: null,
        victoryWayEndIndex: null,
        victoryWayIndexes: [],
        rank: null,
        arrivedPawnsCount: 0,
      };
    },

    createPawns(playerIndex) {
      const pawns = [];

      for (let index = 0; index < this.pawnsCountPerPlayer; index++) {
        pawns.push(this.createPawn(playerIndex, index));
      }

      return pawns;
    },

    createPawn(playerIndex, pawnId) {
      return {
        id: `${playerIndex}-${pawnId}`,
        playerIndex: playerIndex,
        position: -1,
        distanceTraveled: 0,
        isInVictoryWay: false,
        isArrived: false,
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
          wayEndIndex = this.wayLengthPerPawn - 1;
        }

        // calcul de l'index de debut et de fin du chemin de victoire
        const victoryWayStartIndex = wayEndIndex + 1;
        let victoryWayEndIndex = victoryWayStartIndex + this.victoryWayLength;

        if (victoryWayEndIndex > this.wayLengthPerPawn) {
          victoryWayEndIndex = victoryWayEndIndex - (this.wayLengthPerPawn + 1);
        }

        this.players[playerIndex].wayStartIndex = wayStartIndex;
        this.players[playerIndex].wayEndIndex = wayEndIndex;
        this.players[playerIndex].victoryWayStartIndex = victoryWayStartIndex;
        this.players[playerIndex].victoryWayEndIndex = victoryWayEndIndex;
        this.players[playerIndex].victoryWayIndexes =
          this.generatePlayerVictoryWayIndexes(this.players[playerIndex]);
      }
    },

    generatePlayerVictoryWayIndexes(player) {
      const victoryWayIndexes = [];

      let currentVictoryWayIndex = player.victoryWayStartIndex;

      while (currentVictoryWayIndex !== player.victoryWayEndIndex) {
        victoryWayIndexes.push(currentVictoryWayIndex);

        currentVictoryWayIndex++;

        if (currentVictoryWayIndex > this.wayLengthPerPawn) {
          currentVictoryWayIndex = 0;
        }
      }

      return victoryWayIndexes;
    },

    createWayCase(index) {
      return {
        id: index,
        type: "way",
        pawnId: null,
      };
    },

    rollPlayerDice(playerIndex) {
      const player = this.players[playerIndex];
      const diceValue = this.getRandomDiceValue();

      player.currentDiceValue = diceValue;
      const pawnsInPlay = this.getPlayerPawnsInPlay(playerIndex);

      if (diceValue === 6) {
        if (
          pawnsInPlay.length === 1 &&
          !this.canMovePawnRelativeToItsDistanceTraveledValue(pawnsInPlay[0])
        ) {
          this.nextPlayer();
        } else {
          this.players[playerIndex].canMove = true;
        }
      } else {
        if (pawnsInPlay.length === 0) {
          this.nextPlayer();
        } else if (pawnsInPlay.length === 1) {
          if (
            this.canMovePawnRelativeToItsDistanceTraveledValue(pawnsInPlay[0])
          ) {
            this.movePawn(pawnsInPlay[0]);
          } else {
            this.nextPlayer();
          }
        } else {
          this.players[playerIndex].canMove = true;
        }
      }
    },

    getRandomDiceValue() {
      return Math.floor(Math.random() * 6) + 1;
    },

    movePawn(pawn) {
      const player = this.getPlayerByIndex(pawn.playerIndex);
      const diceValue = player.currentDiceValue;
      player.canMove = false;

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

        if (nextPosition > this.wayLengthPerPawn) {
          nextPosition = nextPosition - (this.wayLengthPerPawn + 1);
        }

        if (
          !pawn.isInVictoryWay &&
          pawn.distanceTraveled >= this.wayLengthPerPawn
        ) {
          pawn.isInVictoryWay = true;
        }

        if (pawn.distanceTraveled == this.totalWayLengthPerPawn) {
          pawn.isArrived = true;
        }

        console.log(
          `pawn ${pawn.id} from ${
            pawn.position
          } to ${nextPosition} with dice value ${diceValue} | wayEndIndex : ${
            player.wayEndIndex
          }
          | isInVictoryWay : ${pawn.isInVictoryWay ? "yes" : "no"}
          | wayLengthPerPawn : ${this.wayLengthPerPawn}
          | distanceTraveled : ${pawn.distanceTraveled}
          | totalWayLengthPerPawn : ${this.totalWayLengthPerPawn}
          | canMovePawnRelativeToItsDistanceTraveledValue : ${
            this.canMovePawnRelativeToItsDistanceTraveledValue(pawn)
              ? "yes"
              : "no"
          }
          `
        );

        pawn.position = nextPosition;

        if (pawn.isArrived) {
          console.log(`pawn ${pawn.id} is arrived`);

          player.canMove = false;
          player.arrivedPawnsCount++;

          if (player.arrivedPawnsCount === this.pawnsCountPerPlayer) {
            this.setPlayerAsFinished(player);
          }
        }
      }

      if (diceValue !== 6 || this.playersCount === 1) {
        this.nextPlayer();
      }
    },

    getPlayerByIndex(playerIndex) {
      return this.players[playerIndex];
    },

    nextPlayer() {
      let nextPlayerIndex = +this.currentPlayerIndex + 1;

      if (nextPlayerIndex >= this.playersCount) {
        nextPlayerIndex = 0;
      }

      this.currentPlayerIndex = nextPlayerIndex;
    },

    isPlayerTurn(playerIndex) {
      return this.currentPlayerIndex === playerIndex;
    },

    isPlayerCanMove(playerIndex) {
      return this.players[playerIndex].canMove;
    },

    getPlayerCurrentDiceValue(playerIndex) {
      return this.players[playerIndex].currentDiceValue;
    },

    getPlayerPawnsInPlay(playerIndex) {
      const player = this.players[playerIndex];
      return player.pawns.filter(
        (pawn) => pawn.position !== -1 && !pawn.isArrived
      );
    },

    canMovePawnRelativeToItsDistanceTraveledValue(pawn) {
      if (
        this.totalWayLengthPerPawn - pawn.distanceTraveled <
        this.getPlayerCurrentDiceValue(pawn.playerIndex)
      ) {
        return false;
      }

      return true;
    },

    getPlayerPawnsInBoardIndex(player, boardIndex) {
      return player.pawns.filter((pawn) => pawn.position === boardIndex);
    },

    setPlayerAsFinished(player) {
      player.rank = this.players.filter((player) => player.rank).length + 1;

      // ajouter le joueur au classement
      this.playersRanking.push(player);

      if (player.rank === this.playersCount) {
        this.isGameFinished = true;
      }
    },
  },
});
