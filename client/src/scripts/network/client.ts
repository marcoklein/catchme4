import { Schema } from "@colyseus/schema";
import { Client } from "colyseus.js";
import { GameObjects } from "phaser";
import { BodySchema } from "../generated/BodySchema";
import { GameState } from "../generated/GameState";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import BodySprite from "../objects/Body";
import GameScene from "../scenes/GameScene";
const log = createLogger("client");

export async function connectNetworkClient(scene: GameScene) {
  let serverUrl = "wss://zshwx1.colyseus.de";
  // if (/localhost/.test(window.location.host)) {
  //   serverUrl = "ws://localhost:2567";
  // }
  log("connecting to server url %s", serverUrl);
  const client = new Client(serverUrl);

  const room = await client.joinOrCreate<GameState>("gameRoom");
  log(room.sessionId, "joined", room.id, room.name);

  room.onStateChange((state) => {});
  room.onMessage("message", (message) => {});

  let worldBoundary: Phaser.GameObjects.Shape | undefined = undefined;
  room.state.listen("tileMap", (tileMap) => {
    tileMap.mapSize.onChange = () => {
      if (worldBoundary) worldBoundary.destroy();
      worldBoundary = scene.add.rectangle(
        0,
        0,
        room.state.tileMap.mapSize.width * tileMap.tileSize,
        room.state.tileMap.mapSize.height * tileMap.tileSize,
        0xcccccc
      );
      worldBoundary.setDepth(DEPTH.ground);
    };
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

    let catcherEmitter:
      | Phaser.GameObjects.Particles.ParticleEmitter
      | undefined;
    let particles:
      | Phaser.GameObjects.Particles.ParticleEmitterManager
      | undefined;
    body.listen("isCatcher", (isCatcher) => {
      if (isCatcher) {
        if (!catcherEmitter || !particles) {
          particles = scene.add.particles("particle.red");
          catcherEmitter = particles.createEmitter({});
        }
        catcherEmitter.setScale(0.3);
        catcherEmitter.setSpeed(30);
        catcherEmitter.setLifespan(100);
        catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);
        catcherEmitter.startFollow(bodySprite);
        particles.setDepth(DEPTH.backgroundEffect);
      } else if (particles) {
        log("destroying particles");
        particles.destroy();
        particles = undefined;
        catcherEmitter = undefined;
      }
    });

    body.triggerAll();
  };
  room.state.listen("tileMap", (tileMap) =>
    tileMap.listen("tiles", (tiles) => {
      tiles.onAdd = (tile, key) => {
        log("new tile %s", key);
      };
    })
  );

  return room;
}
