import { GameState } from "./GameState";

/**
 * Decorates `GameState` with utility functions for easier state manipulation and data retrieval.
 */
export class GameStateFacade {
  constructor(readonly state: GameState) {}

  findPlayerAndBody(sessionId: string) {
    const player = this.state.players.get(sessionId);
    let body = undefined;
    if (!player) {
      console.error(`No player for session id ${sessionId}`);
    } else {
      body = this.state.level?.bodies.get(player.bodyId);
    }
    return {
      player,
      body,
    };
  }
}
