import { Schema } from "@colyseus/schema";
import { Client } from "colyseus.js";
import { GameObjects } from "phaser";
import { GameState } from "../generated/GameState";
import { createLogger } from "../logger";
import Body from "../objects/Body";
import GameScene from "../scenes/GameScene";
const log = createLogger("client");

export async function connectNetworkClient(scene: GameScene) {
  const client = new Client("ws://localhost:2567");

  const room = await client.joinOrCreate<GameState>("gameRoom");
  log(room.sessionId, "joined", room.id, room.name);
  room.onStateChange((state) => {
    log(room.name, "has new state", state);
  });
  room.onMessage("message", (message) => {
    log(room.id, "received", message);
  });
  room.state.players.onAdd = (player) => {
    log("added new player with id", player.id);

    player.onChange = (changes) => {
      changes.forEach((change) => {
        log(change.field);
        log(change.value);
        log(change.previousValue);
      });
    };
    player.onRemove = () => {
      log("player", player.id, "removed");
    };

    player.triggerAll();
  };

  const bodiesMap: Map<Schema, GameObjects.GameObject> = new Map();
  room.state.bodies.onAdd = (body) => {
    log("added new body with id", body.id);

    // adding new player to scene
    const tank = new Body(scene, 200, 200);
    bodiesMap.set(body, tank);

    body.onChange = (changes) => {
      changes.forEach((change) => {
        const changeHandler = {
          x: (value: number) => {
            tank.setX(value);
          },
          y: (value: number) => {
            tank.setY(value);
          },
        };
        const handler = changeHandler[change.field];
        if (!handler) {
          console.warn("no change handler for attribute", change.field);
          return;
        }
        handler(change.value);
      });
    };
    body.onRemove = () => {
      log("player", body.id, "removed");
      const tank = bodiesMap.get(body);
      tank?.destroy();
      bodiesMap.delete(body);
    };

    body.triggerAll();
  };

  return room;
}
