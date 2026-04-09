import { Chess } from "chess.js";
import { GameEngine } from "./base";
import type {
  ChessMove,
  GameMove,
  GameResult,
  GameSnapshot,
  PlayerColor,
} from "../../src/shared/types";

export class ChessEngine extends GameEngine {
  readonly gameType = "chess" as const;
  private chess = new Chess();
  private moveHistory: ChessMove[] = [];

  makeMove(move: GameMove, player: PlayerColor): boolean {
    if (this.getResult()) return false;

    const currentPlayer: PlayerColor = this.chess.turn() === "w" ? "white" : "black";
    if (player !== currentPlayer) return false;

    const m = move as ChessMove;
    try {
      const result = this.chess.move({ from: m.from, to: m.to, promotion: m.promotion });
      if (!result) return false;
      this.moveHistory.push(m);
      return true;
    } catch {
      return false;
    }
  }

  getSnapshot(): GameSnapshot {
    return {
      gameType: "chess",
      board: this.chess.fen(),
      currentTurn: this.chess.turn() === "w" ? "white" : "black",
      moveHistory: [...this.moveHistory],
      result: this.getResult(),
    };
  }

  getResult(): GameResult | null {
    if (this.chess.isCheckmate()) {
      const loser = this.chess.turn() === "w" ? "white" : "black";
      return { winner: loser === "white" ? "black" : "white" };
    }
    if (this.chess.isDraw() || this.chess.isStalemate() || this.chess.isThreefoldRepetition() || this.chess.isInsufficientMaterial()) {
      return { draw: true };
    }
    return null;
  }

  getCurrentTurn(): PlayerColor {
    return this.chess.turn() === "w" ? "white" : "black";
  }
}
