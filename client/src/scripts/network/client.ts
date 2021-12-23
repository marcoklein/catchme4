import { Schema } from "@colyseus/schema";
import { Client } from "colyseus.js";
import { GameObjects } from "phaser";
import { GameState } from "../generated/GameState";
import { createLogger } from "../logger";
import BodySprite from "../objects/Body";
import GameScene from "../scenes/GameScene";
const log = createLogger("client");

export async function connectNetworkClient(scene: GameScene) {
  const client = new Client("ws://localhost:2567");

  const room = await client.joinOrCreate<GameState>("gameRoom");
  log(room.sessionId, "joined", room.id, room.name);

  room.onStateChange((state) => {});
  room.onMessage("message", (message) => {});

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
    const bodySprite = new BodySprite(scene, 200, 200);
    bodiesMap.set(body, bodySprite);

    body.position.listen("x", (x) => bodySprite.setX(x));
    body.position.listen("y", (y) => bodySprite.setY(y));
    body.moveDirection.onChange = () => {
      if (body.moveDirection.x !== 0 || body.moveDirection.y !== 0) {
        log("setting rotation %j", body.moveDirection);
        bodySprite.setRotation(
          new Phaser.Math.Vector2(body.moveDirection).angle()
        );
      }
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
