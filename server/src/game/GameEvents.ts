import { BodySchema, Player } from "./schema/GameState";

export type EVENTS = {
  caught: { catcher?: BodySchema; caught: BodySchema };
  playerJoined: { player: Player };
  playerDisconnected: { player: Player };
};

export class GameEvents {
  listenersMap = new Map<
    keyof EVENTS,
    Array<(arg: EVENTS[keyof EVENTS]) => void>
  >();

  emit<T extends keyof EVENTS>(event: T, data: EVENTS[T]) {
    this.listenersMap.get(event)?.forEach((listener) => {
      listener(data);
    });
  }
  on<T extends keyof EVENTS>(event: T, callback: (data: EVENTS[T]) => void) {
    let listeners = this.listenersMap.get(event);
    if (!listeners) {
      listeners = [];
      this.listenersMap.set(event, listeners);
    }
    listeners.push(callback as any);
  }
}
