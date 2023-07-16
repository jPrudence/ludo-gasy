import { defineStore } from "pinia";

const WAY_LENGTH_PER_PAWN = 51; // counted from 0
const VICTORY_WAY_LENGTH = 6;
const TOTAL_WAY_LENGTH_PER_PAWN = WAY_LENGTH_PER_PAWN + VICTORY_WAY_LENGTH - 1; // -1 : because 0 is counted
const playerColors = ["red", "blue", "green", "yellow"];

export const useLudoStore = defineStore("ludo", {
  state: () => ({
    // longeur de parcours par pion
    wayLengthPerPawn: WAY_LENGTH_PER_PAWN,
    // longeur chemin de victoire
    victoryWayLength: VICTORY_WAY_LENGTH,
    // total de cases avec chemin de victoire
    totalWayLengthPerPawn: TOTAL_WAY_LENGTH_PER_PAWN,
    // nombre de cases distance entre les points de départ de chaque joueur
    // default : 13
    distanceBetweenStartPoints: 13,
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
    init() {
      this.gameIsFinished = false;
      this.playersRanking = [];

      this.calculateDistanceBetweenStartPoints();

      this.createPlayers();

      this.prepareBoard();
    },

    setPlayersCount(count) {
      if (count <= 4) {
        this.playersCount = count;
      } else {
        console.error("Le nombre de joueurs doit être inférieur ou égal à 4");
      }

      return this;
    },

    calculateDistanceBetweenStartPoints() {
      if (this.playersCount == 2) {
        this.distanceBetweenStartPoints = 26;
      } else {
        this.distanceBetweenStartPoints = 13;
      }
    },

    setPawnCountPerPlayer(count) {
      this.pawnsCountPerPlayer = count;
      return this;
    },

    createPlayers() {
      for (let index = 0; index < this.playersCount; index++) {
        const player = this.createPlayer(index);
        player.pawns = this.createPawns(player);
        this.players.push(player);
      }
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
        color: playerColors[index],
      };
    },

    createPawns(player) {
      const pawns = [];

      for (let index = 0; index < this.pawnsCountPerPlayer; index++) {
        pawns.push(this.createPawn(player, index));
      }

      return pawns;
    },

    createPawn(player, pawnIndex) {
      return {
        id: `${player.index}-${pawnIndex}`,
        index: pawnIndex,
        playerIndex: player.index,
        position: -1,
        distanceTraveled: 0,
        isInVictoryWay: false,
        isArrived: false,
        color: player.color,
      };
    },

    prepareBoard() {
      // creation des cases de parcours
      for (let index = 0; index <= this.wayLengthPerPawn; index++) {
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
        pawns: [],
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
      const previousPosition = pawn.position;

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

        console.log(
          `distanceTraveled : ${pawn.distanceTraveled} - totalWayLengthPerPawn : ${this.totalWayLengthPerPawn}`
        );

        if (pawn.distanceTraveled == this.totalWayLengthPerPawn) {
          pawn.isArrived = true;
        }

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

      if (previousPosition != pawn.position) {
        this.updatePawnInTheBoard(pawn, previousPosition);
      }

      if (diceValue !== 6 || this.playersCount === 1) {
        this.nextPlayer();
      }
    },

    updatePawnInTheBoard(pawn, previousPosition) {
      const previousPawnBoard = this.board[previousPosition];
      const currentPawnBoard = this.board[pawn.position];

      if (previousPosition !== -1) {
        previousPawnBoard.pawns = previousPawnBoard.pawns.filter(
          (pawnInBoard) => pawnInBoard.id !== pawn.id
        );
      }

      this.handleOtherPawnsInTheSameCase(currentPawnBoard, pawn);
    },

    handleOtherPawnsInTheSameCase(pawnBoard, lastPawn) {
      const filteredBoardPawns = [lastPawn];

      pawnBoard.pawns.map((pawn) => {
        if (!pawn.isInVictoryWay && pawn.playerIndex !== lastPawn.playerIndex) {
          this.players[pawn.playerIndex].pawns[pawn.index].position = -1;
          this.players[pawn.playerIndex].pawns[pawn.index].distanceTraveled = 0;
        } else {
          filteredBoardPawns.push(pawn);
        }
      });

      this.board[pawnBoard.id].pawns = filteredBoardPawns;
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

      if (player.rank === this.playersCount - 1) {
        this.isGameFinished = true;
      }
    },
  },
});
