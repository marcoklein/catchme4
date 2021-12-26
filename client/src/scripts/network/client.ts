import { Client, Room } from "colyseus.js";
import { GameObjects } from "phaser";
import { GameState } from "../generated/GameState";
import { Player } from "../generated/Player";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import GameScene from "../scenes/GameScene";
import { bodySynchronizer } from "./bodySynchronizer";
import { PingHandler } from "./PingHandler";
const log = createLogger("client");

export class NetworkSynchronizer {
  scene: GameScene;
  room: Room<GameState>;
  ownPlayer: Player | undefined;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  async connect() {
    let serverUrl = "wss://zshwx1.colyseus.de";
    if (/localhost/.test(window.location.host)) {
      serverUrl = "ws://localhost:2567";
    }
    log("connecting to server url %s", serverUrl);
    const client = new Client(serverUrl);

    this.room = await client.joinOrCreate<GameState>("gameRoom");
    log(this.room.sessionId, "joined", this.room.id, this.room.name);

    this.room.onStateChange((state) => {});
    this.room.onMessage("message", (message) => {});

    let worldBoundary: Phaser.GameObjects.Shape | undefined = undefined;
    this.room.state.listen("tileMap", (tileMap) => {
      tileMap.mapSize.onChange = () => {
        if (worldBoundary) worldBoundary.destroy();
        worldBoundary = this.scene.add.rectangle(
          0,
          0,
          this.room.state.tileMap.mapSize.width * tileMap.tileSize,
          this.room.state.tileMap.mapSize.height * tileMap.tileSize,
          0xcccccc
        );
        worldBoundary.setDepth(DEPTH.ground);
        // change game size to match tile map
        this.scene.scale.setGameSize(
          this.room.state.tileMap.mapSize.width * tileMap.tileSize,
          this.room.state.tileMap.mapSize.height * tileMap.tileSize
        );
        this.scene.cameras.main.centerOn(0, 0);
      };
    });

    this.room.state.players.onAdd = (player) => {
      log("added new player with id", player.id);
      if (this.room.sessionId === player.id) {
        log("found own player with id %s", player.id);
        this.ownPlayer = player;
      }

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
    this.room.state.bodies.onAdd = (body) => bodySynchronizer(this.scene, body);

    const tileGroup = this.scene.add.group();
    this.room.state.listen("tileMap", (tileMap) => {
      const mapWidthInPixel = tileMap.mapSize.width * tileMap.tileSize;
      const mapHeightInPixel = tileMap.mapSize.height * tileMap.tileSize;
      const tileWorldX = -tileMap.mapSize.width * tileMap.tileSize * 0.5;
      const tileWorldY = -tileMap.mapSize.height * tileMap.tileSize * 0.5;
      tileMap.listen("tiles", (tiles) => {
        tiles.onAdd = (tile, key) => {
          let tileImage: GameObjects.Image | undefined;
          tile.listen("texture", () => {
            if (tileImage) {
              tileGroup.remove(tileImage, true, true);
              tileImage = undefined;
            }
            // TODO refactor into factory for tile image
            tileImage = new GameObjects.Image(
              this.scene,
              tileWorldX + tile.position.x * tileMap.tileSize,
              tileWorldY + tile.position.y * tileMap.tileSize,
              tile.texture.key,
              tile.texture.frameKey || tile.texture.frameIndex
            );
            tileImage.setDisplaySize(tileMap.tileSize, tileMap.tileSize);
            tileImage.setDepth(tile.layer || DEPTH.tile);
            tileImage.setOrigin(0, 0);
            tileGroup.add(tileImage);
            this.scene.add.existing(tileImage);
          });
          log("new tile %s", key);
          tile.onRemove = () => {
            if (tileImage) {
              tileGroup.remove(tileImage, true, true);
              tileImage = undefined;
              log("removed tile %s", key);
            }
          };
        };
      });
    });

    return this.room;
  }
}
