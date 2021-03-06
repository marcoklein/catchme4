import { GameObjects } from "phaser";
import { GameLevelSchema } from "../generated/GameLevelSchema";
import { DEPTH } from "../globals";
import { initInput } from "../input/input";
import { createLogger } from "../logger";
import { bodySynchronizer } from "../network/bodySynchronizer";
import { Network } from "../network/Network";
import { ParticleManager } from "../objects/ParticleManager";
import { getTextureFrameKey } from "../shared/schema-utils";
import HudScene from "./HudScene";
const log = createLogger("levelscene");

export default class LevelScene extends Phaser.Scene {
  hudScene: HudScene;
  network: Network;
  levelState: GameLevelSchema;
  levelListeners: any[] = [];
  particles = new ParticleManager(this);

  constructor() {
    super({ key: "LevelScene" });
  }

  create({ network }: { network: Network }) {
    this.events.on("destroy", () => this.onDestroy());

    log("created level scene");
    this.cameras.main.centerOn(0, 0);
    this.hudScene = this.scene.add("HudScene", HudScene, true) as HudScene;
    this.network = network;
    this.levelState = network.room.state.level;
    this.hudScene.updateGameStatusText("Joining...");

    initInput(this, network.room);
    this.initializeLevelState(this, this.levelState);
  }

  update() {
    if (this.network.ownPlayer) {
      const playerBody = this.network.room.state.level.bodies.get(
        this.network.ownPlayer.bodyId
      );
    }
  }

  private initializeLevelState(scene: Phaser.Scene, state: GameLevelSchema) {
    let worldBoundary: Phaser.GameObjects.Shape | undefined = undefined;
    this.levelListeners.push(
      state.listen("tileMap", (tileMap) => {
        tileMap.mapSize.onChange = () => {
          if (worldBoundary) worldBoundary.destroy();
          worldBoundary = scene.add.rectangle(
            0,
            0,
            tileMap.mapSize.width * tileMap.tileSize,
            tileMap.mapSize.height * tileMap.tileSize,
            0xcccccc
          );
          worldBoundary.setDepth(DEPTH.ground);
          // change game size to match tile map
          scene.scale.setGameSize(
            tileMap.mapSize.width * tileMap.tileSize,
            tileMap.mapSize.height * tileMap.tileSize
          );
          scene.cameras.main.centerOn(0, 0);
        };
      })
    );

    // TODO refactor create body synchronizer
    state.bodies.onAdd = (body) => bodySynchronizer(this, body);

    this.levelState.listen("state", (state) => {
      const stateLogic = {
        warmup: () => {
          this.hudScene.updateGameStatusText("Waiting for others to join...");
        },
        starting: () => {
          this.hudScene.updateGameStatusText("Starting...");
        },
        running: () => {
          this.hudScene.updateGameStatusText("Running");
        },
        finished: () => {
          this.hudScene.updateGameStatusText("Finished");
        },
      };
      const logic = stateLogic[state];
      if (logic === undefined) {
        console.warn(`unhandled level state: ${state}`);
      } else {
        logic();
      }
    });

    const tileGroup = scene.add.group();
    this.levelListeners.push(
      state.listen("tileMap", (tileMap) => {
        const mapWidthInPixel = tileMap.mapSize.width * tileMap.tileSize;
        const mapHeightInPixel = tileMap.mapSize.height * tileMap.tileSize;
        const tileWorldX = -tileMap.mapSize.width * tileMap.tileSize * 0.5;
        const tileWorldY = -tileMap.mapSize.height * tileMap.tileSize * 0.5;
        this.levelListeners.push(
          tileMap.listen("tiles", (tiles) => {
            tiles.onAdd = (tile, key) => {
              let tileImage: GameObjects.Image | undefined;
              this.levelListeners.push(
                tile.listen("texture", () => {
                  if (tileImage) {
                    tileGroup.remove(tileImage, true, true);
                    tileImage = undefined;
                  }
                  // TODO refactor into factory for tile image
                  tileImage = new GameObjects.Image(
                    scene,
                    tileWorldX + tile.position.x * tileMap.tileSize,
                    tileWorldY + tile.position.y * tileMap.tileSize,
                    tile.texture.key,
                    getTextureFrameKey(tile.texture)
                  );
                  tileImage.setDisplaySize(tileMap.tileSize, tileMap.tileSize);
                  tileImage.setDepth(tile.layer || DEPTH.tile);
                  tileImage.setOrigin(0, 0);
                  tileGroup.add(tileImage);
                  scene.add.existing(tileImage);
                })
              );
              log("new tile %s", key);
              tile.onRemove = () => {
                if (tileImage) {
                  tileGroup.remove(tileImage, true, true);
                  tileImage = undefined;
                  log("removed tile %s", key);
                }
              };
            };
          })
        );
      })
    );
    this.levelListeners.push(
      state.listen("remainingGameTimeMillis", (remainingGameTimeMillis) => {
        this.hudScene.updateRemainingTimeText(remainingGameTimeMillis);
      })
    );
    state.triggerAll();
  }

  onDestroy() {
    log("destroying level scene");
    this.levelListeners.forEach((listener) => listener());
    this.levelListeners = [];
    this.scene.remove("HudScene");
    this.particles.destroyParticles();
  }
}
