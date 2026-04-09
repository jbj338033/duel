import { GameEngine } from "./base";
import type {
  GameMove,
  GameResult,
  GameSnapshot,
  GomokuMove,
  PlayerColor,
} from "../../src/shared/types";

const SIZE = 15;

type Cell = PlayerColor | null;

export class GomokuEngine extends GameEngine {
  readonly gameType = "gomoku" as const;
  private board: Cell[][];
  private currentTurn: PlayerColor = "black";
  private moveHistory: GomokuMove[] = [];
  private result: GameResult | null = null;

  constructor() {
    super();
    this.board = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
  }

  makeMove(move: GameMove, player: PlayerColor): boolean {
    if (this.result) return false;
    if (player !== this.currentTurn) return false;

    const m = move as GomokuMove;
    if (m.row < 0 || m.row >= SIZE || m.col < 0 || m.col >= SIZE) return false;
    if (this.board[m.row][m.col] !== null) return false;

    this.board[m.row][m.col] = player;
    this.moveHistory.push(m);

    if (this.checkWin(m.row, m.col, player)) {
      this.result = { winner: player };
    } else if (this.moveHistory.length === SIZE * SIZE) {
      this.result = { draw: true };
    } else {
      this.currentTurn = player === "black" ? "white" : "black";
    }

    return true;
  }

  getSnapshot(): GameSnapshot {
    return {
      gameType: "gomoku",
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

  private checkWin(row: number, col: number, player: PlayerColor): boolean {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal
      [1, -1], // anti-diagonal
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      for (let d = 1; d < 5; d++) {
        const r = row + dr * d;
        const c = col + dc * d;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;
        if (this.board[r][c] !== player) break;
        count++;
      }
      for (let d = 1; d < 5; d++) {
        const r = row - dr * d;
        const c = col - dc * d;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;
        if (this.board[r][c] !== player) break;
        count++;
      }
      if (count >= 5) return true;
    }

    return false;
  }
}
