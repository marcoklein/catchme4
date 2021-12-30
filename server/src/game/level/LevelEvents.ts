import { BodySchema, Player } from "../schema/GameState";

export type LEVEL_EVENTS = {
  caught: { catcher?: BodySchema; caught: BodySchema };
  newPlayer: { player: Player; body: BodySchema };
};

// TODO merge with GameEvents and create generic events handler
export class LevelEvents {
  listenersMap = new Map<
    keyof LEVEL_EVENTS,
    Array<(arg: LEVEL_EVENTS[keyof LEVEL_EVENTS]) => void>
  >();

  emit<T extends keyof LEVEL_EVENTS>(event: T, data: LEVEL_EVENTS[T]) {
    this.listenersMap.get(event)?.forEach((listener) => {
      listener(data);
    });
  }
  on<T extends keyof LEVEL_EVENTS>(
    event: T,
    callback: (data: LEVEL_EVENTS[T]) => void
  ) {
    let listeners = this.listenersMap.get(event);
    if (!listeners) {
      listeners = [];
      this.listenersMap.set(event, listeners);
    }
    listeners.push(callback as any);
  }
}
