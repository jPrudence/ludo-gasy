import { defineStore } from "pinia";

const WAY_LENGTH_PER_PAWN = 51; // counted from 0
const VICTORY_WAY_LENGTH = 6;
const TOTAL_WAY_LENGTH_PER_PAWN = WAY_LENGTH_PER_PAWN + VICTORY_WAY_LENGTH - 1; // -1 : because 0 is counted
const playerColors = ["red", "green", "blue", "yellow"];

export const useLudoStore = defineStore("ludo", {
  persist: true,
  state: () => ({
    // longeur de parcours par pion
    cellLengthPerPawn: WAY_LENGTH_PER_PAWN,
    // longeur chemin de victoire
    victoryCellLength: VICTORY_WAY_LENGTH,
    // total de cases avec chemin de victoire
    totalCellLengthPerPawn: TOTAL_WAY_LENGTH_PER_PAWN,
    // nombre de cases distance entre les points de départ de chaque joueur
    // default : 13
    distanceBetweenStartPoints: 13,
    // nombre de pions par joueur
    pawnsCountPerPlayer: 4,
    // nombre de joueurs
    playersCount: 2,
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
    // etat du dé
    isDiceRolling: false,
    // temps de déplacement d'un pion de case en case
    movingSleepTime: 100,
    // distance entre les cases sécurisées
    safeCellDistance: 8,
  }),

  actions: {
    init() {
      this.isGameFinished = false;
      this.playersRanking = [];
      this.players = [];
      this.board = [];
      this.currentPlayerIndex = 0;

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
        name: `Mpilalao ${index + 1}`,
        currentDiceValue: 0,
        cellStartIndex: null,
        cellEndIndex: null,
        victoryCellStartIndex: null,
        victoryCellEndIndex: null,
        victoryCellIndexes: [],
        rank: null,
        arrivedPawnsCount: 0,
        color: playerColors[index],
        isMoving: false,
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
        isInVictoryCell: false,
        isArrived: false,
        color: player.color,
        isMoving: false,
      };
    },

    prepareBoard() {
      // creation des cases de parcours
      for (let index = 0; index <= this.cellLengthPerPawn; index++) {
        const cell = this.createCell(index);
        this.board.push(cell);
      }

      // assignation des cases de parcours par joueur
      for (
        let playerIndex = 0;
        playerIndex < this.playersCount;
        playerIndex++
      ) {
        const player = this.players[playerIndex];

        const distanceBetweenStartPoints =
          this.distanceBetweenStartPoints * playerIndex;

        const cellStartIndex = distanceBetweenStartPoints;

        let cellEndIndex = cellStartIndex - 2;

        if (cellEndIndex < 0) {
          cellEndIndex = this.cellLengthPerPawn - 1;
        }

        // calcul de l'index de debut et de fin du chemin de victoire
        const victoryCellStartIndex = cellEndIndex + 1;
        let victoryCellEndIndex =
          victoryCellStartIndex + (this.victoryCellLength - 1);

        if (victoryCellEndIndex > this.cellLengthPerPawn) {
          victoryCellEndIndex =
            victoryCellEndIndex - (this.cellLengthPerPawn + 1);
        }

        player.cellStartIndex = cellStartIndex;
        this.board[cellStartIndex].cellStartOf = {
          playerIndex: player.index,
          color: player.color,
        };

        player.cellEndIndex = cellEndIndex;
        this.board[cellEndIndex].cellEndOf = {
          playerIndex: player.index,
          color: player.color,
        };

        player.victoryCellStartIndex = victoryCellStartIndex;
        player.victoryCellEndIndex = victoryCellEndIndex;
        player.victoryCellIndexes =
          this.generatePlayerVictoryCellIndexes(player);
      }

      this.assignSafeCells();
    },

    generatePlayerVictoryCellIndexes(player) {
      const victoryCellIndexes = this.generateIndexesBetween(
        player.victoryCellStartIndex,
        player.victoryCellEndIndex
      );

      // marquage des cases de victoire
      victoryCellIndexes.map((currentVictoryCellIndex) => {
        this.board[currentVictoryCellIndex].victoryCellOf = {
          playerIndex: player.index,
          color: player.color,
          victoryCellEndIndex: player.victoryCellEndIndex,
        };
      });

      return victoryCellIndexes;
    },

    generateIndexesBetween(startIndex, endIndex) {
      if (startIndex === endIndex) {
        return [startIndex];
      }

      const indexes = [];

      let currentIndex = startIndex;

      while (currentIndex !== endIndex) {
        indexes.push(currentIndex);

        currentIndex++;

        if (currentIndex > this.cellLengthPerPawn) {
          currentIndex = 0;
        }
      }

      indexes.push(endIndex);

      return indexes;
    },

    createCell(index) {
      return {
        id: index,
        pawns: [],
        victoryCellOf: null,
        cellStartOf: null,
        cellEndOf: null,
        hasMovingShadowOf: null,
        isSafe: false,
      };
    },

    async rollPlayerDice(playerIndex) {
      await this.simulateDiceRolling();

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
            await this.movePawn(pawnsInPlay[0]);
          } else {
            this.nextPlayer();
          }
        } else {
          this.players[playerIndex].canMove = true;
        }
      }
    },

    async simulateDiceRolling() {
      this.isDiceRolling = true;

      await this.sleep(300);

      this.isDiceRolling = false;
    },

    getRandomDiceValue() {
      return Math.floor(Math.random() * 6) + 1;
    },

    async movePawn(pawn) {
      const currentPlayer = this.getPlayerByIndex(pawn.playerIndex);
      const diceValue = currentPlayer.currentDiceValue;
      currentPlayer.canMove = false;
      const previousPosition = pawn.position;

      if (!diceValue) {
        console.log("no dice value");
        return;
      }

      if (pawn.position === -1) {
        if (diceValue === 6) {
          pawn.position = currentPlayer.cellStartIndex;

          console.log(`pawn ${pawn.id} is out of home`);
        } else {
          console.log("Can't move pawn");
        }
      } else {
        pawn.distanceTraveled += diceValue;
        let nextPosition = +pawn.position + +diceValue;

        if (nextPosition > this.cellLengthPerPawn) {
          nextPosition = nextPosition - (this.cellLengthPerPawn + 1);
        }

        if (
          !pawn.isInVictoryCell &&
          pawn.distanceTraveled >= this.cellLengthPerPawn
        ) {
          pawn.isInVictoryCell = true;
        }

        if (pawn.distanceTraveled == this.totalCellLengthPerPawn) {
          pawn.isArrived = true;
        }

        await this.movePawnSlowlyToCell(pawn, nextPosition);

        if (pawn.isArrived) {
          console.log(`pawn ${pawn.id} is arrived`);

          currentPlayer.canMove = false;
          currentPlayer.arrivedPawnsCount++;

          if (currentPlayer.arrivedPawnsCount === this.pawnsCountPerPlayer) {
            this.setPlayerAsFinished(player);
          }
        }
      }

      if (previousPosition != pawn.position) {
        this.clearPawnFromItsPreviousCell(pawn, previousPosition);

        const currentPawnBoard = this.board[pawn.position];
        this.handleOtherPawnsInTheSameCell(currentPawnBoard, pawn);
      }

      if (diceValue !== 6 || this.playersCount === 1) {
        this.nextPlayer();
      }
    },

    async movePawnSlowlyToCell(pawn, targetCellIndex) {
      this.players[pawn.playerIndex].inMoving = true;
      pawn.isMoving = true;

      const temporaryPawnCellIndexes = this.generateIndexesBetween(
        pawn.position,
        targetCellIndex
      );

      const firstTemporaryCellIndex = temporaryPawnCellIndexes[0];

      for await (const temporaryCellIndex of temporaryPawnCellIndexes) {
        if (temporaryCellIndex !== firstTemporaryCellIndex) {
          this.board[temporaryCellIndex].pawns.push(pawn);

          await this.sleep(this.movingSleepTime);
        } else {
          await this.sleep(this.movingSleepTime / 2);
        }

        this.setCellPawnMovingShadow(
          pawn,
          firstTemporaryCellIndex,
          temporaryCellIndex
        );

        this.clearPawnFromItsPreviousCell(pawn, temporaryCellIndex);

        pawn.position = temporaryCellIndex;
      }

      pawn.isMoving = false;
      this.players[pawn.playerIndex].inMoving = false;

      await this.clearPawnMovingShadow();
    },

    setCellPawnMovingShadow(pawn, start, cellIndex) {
      if (pawn.isInVictoryCell) {
        this.clearPawnMovingShadow();

        return;
      }

      const previousCellIndexes = [cellIndex - 1, cellIndex - 2, cellIndex - 3]
        .map((index) => (index < 0 ? this.cellLengthPerPawn + index : index))
        .filter((index) => index >= start);

      this.board.forEach((cell, index) => {
        this.board[index].hasMovingShadowOf = previousCellIndexes.includes(
          index
        )
          ? {
              pawnId: pawn.id,
              color: pawn.color,
              movingShadowIndex: previousCellIndexes.indexOf(index),
            }
          : null;
      });
    },

    async clearPawnMovingShadow() {
      this.board.forEach(async (cell, index) => {
        if (this.board[index].hasMovingShadowOf) {
          await this.sleep(this.movingSleepTime);
        }

        this.board[index].hasMovingShadowOf = null;
      });
    },

    clearPawnFromItsPreviousCell(pawn, previousPosition) {
      const previousPawnBoard = this.board[previousPosition];

      if (previousPosition !== -1) {
        previousPawnBoard.pawns = previousPawnBoard.pawns.filter(
          (pawnInBoard) => pawnInBoard.id !== pawn.id
        );
      }
    },

    handleOtherPawnsInTheSameCell(pawnCell, lastPawn) {
      if (lastPawn.isInVictoryCell || pawnCell.isSafe) {
        this.board[pawnCell.id].pawns.push(lastPawn);
        return;
      }

      const filteredBoardPawns = [lastPawn];

      pawnCell.pawns.map((pawn) => {
        if (
          !pawn.isInVictoryCell &&
          pawn.playerIndex !== lastPawn.playerIndex
        ) {
          this.players[pawn.playerIndex].pawns[pawn.index].position = -1;
          this.players[pawn.playerIndex].pawns[pawn.index].distanceTraveled = 0;
        } else {
          filteredBoardPawns.push(pawn);
        }
      });

      this.board[pawnCell.id].pawns = filteredBoardPawns;
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
        this.totalCellLengthPerPawn - pawn.distanceTraveled <
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

    async sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    assignSafeCells() {
      this.board.map((cell, index) => {
        if (index % 13 === 0) {
          this.board[index].isSafe = true;
          this.board[index + this.safeCellDistance].isSafe = true;
        }
      });
    },
  },
});
