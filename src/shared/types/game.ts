export type GameType = "gomoku" | "chess" | "connect4";

export type PlayerColor = "black" | "white";

export interface GomokuMove {
  row: number;
  col: number;
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface Connect4Move {
  col: number;
}

export type GameMove = GomokuMove | ChessMove | Connect4Move;

export type GameResult =
  | { winner: PlayerColor }
  | { draw: true };

export interface GameSnapshot {
  gameType: GameType;
  board: unknown;
  currentTurn: PlayerColor;
  moveHistory: GameMove[];
  result: GameResult | null;
}

export interface ServerToClientEvents {
  "room:waiting": () => void;
  "room:started": (data: {
    color: PlayerColor;
    snapshot: GameSnapshot;
  }) => void;
  "game:updated": (snapshot: GameSnapshot) => void;
  "game:ended": (snapshot: GameSnapshot) => void;
  "opponent:disconnected": () => void;
  error: (msg: string) => void;
}

export interface ClientToServerEvents {
  "room:join": (data: { gameType: GameType; roomId: string }) => void;
  "game:move": (move: GameMove) => void;
  "game:rematch": () => void;
}
