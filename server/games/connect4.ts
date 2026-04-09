import { GameEngine } from "./base";
import type {
  Connect4Move,
  GameMove,
  GameResult,
  GameSnapshot,
  PlayerColor,
} from "../../src/shared/types";

const ROWS = 6;
const COLS = 7;

type Cell = PlayerColor | null;

export class Connect4Engine extends GameEngine {
  readonly gameType = "connect4" as const;
  private board: Cell[][];
  private currentTurn: PlayerColor = "black";
  private moveHistory: Connect4Move[] = [];
  private result: GameResult | null = null;

  constructor() {
    super();
    this.board = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
  }

  makeMove(move: GameMove, player: PlayerColor): boolean {
    if (this.result) return false;
    if (player !== this.currentTurn) return false;

    const m = move as Connect4Move;
    if (m.col < 0 || m.col >= COLS) return false;

    const row = this.getDropRow(m.col);
    if (row === -1) return false;

    this.board[row][m.col] = player;
    this.moveHistory.push(m);

    if (this.checkWin(row, m.col, player)) {
      this.result = { winner: player };
    } else if (this.moveHistory.length === ROWS * COLS) {
      this.result = { draw: true };
    } else {
      this.currentTurn = player === "black" ? "white" : "black";
    }

    return true;
  }

  getSnapshot(): GameSnapshot {
    return {
      gameType: "connect4",
      board: this.board.map((row) => [...row]),
      currentTurn: this.currentTurn,
      moveHistory: [...this.moveHistory],
      result: this.result,
    };
  }

  getResult(): GameResult | null {
    return this.result;
  }

  getCurrentTurn(): PlayerColor {
    return this.currentTurn;
  }

  private getDropRow(col: number): number {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (this.board[row][col] === null) return row;
    }
    return -1;
  }

  private checkWin(row: number, col: number, player: PlayerColor): boolean {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      let count = 1;
      for (let d = 1; d < 4; d++) {
        const r = row + dr * d, c = col + dc * d;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
        if (this.board[r][c] !== player) break;
        count++;
      }
      for (let d = 1; d < 4; d++) {
        const r = row - dr * d, c = col - dc * d;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
        if (this.board[r][c] !== player) break;
        count++;
      }
      if (count >= 4) return true;
    }

    return false;
  }
}
