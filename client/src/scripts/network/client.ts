import { Schema } from "@colyseus/schema";
import { Client } from "colyseus.js";
import { GameObjects } from "phaser";
import { GameState } from "../generated/GameState";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import BodySprite from "../objects/Body";
import TileImage from "../objects/TileImage";
import GameScene from "../scenes/GameScene";
import { bodySynchronizer } from "./bodySynchronizer";
const log = createLogger("client");

export async function connectNetworkClient(scene: GameScene) {
  let serverUrl = "wss://zshwx1.colyseus.de";
  if (/localhost/.test(window.location.host)) {
    serverUrl = "ws://localhost:2567";
  }
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

  // TODO refactor create body synchronizer
  room.state.bodies.onAdd = (body) => bodySynchronizer(scene, body);

  const tileGroup = scene.add.group();
  room.state.listen("tileMap", (tileMap) => {
    const tileWorldX = -tileMap.mapSize.width * tileMap.tileSize * 0.5;
    const tileWorldY = -tileMap.mapSize.height * tileMap.tileSize * 0.5;
    tileMap.listen("tiles", (tiles) => {
      tiles.onAdd = (tile, key) => {
        const tileSprite = new TileImage(
          scene,
          tileWorldX + tile.position.x * tileMap.tileSize,
          tileWorldY + tile.position.y * tileMap.tileSize,
          "tile.wall.1"
        );
        tileSprite.setOrigin(0, 0);
        tileGroup.add(tileSprite);
        log("new tile %s", key);
        tile.onRemove = () => {
          tileGroup.remove(tileSprite, true, true);
          log("removed tile %s", key);
        };
      };
    });
  });

  return room;
}
