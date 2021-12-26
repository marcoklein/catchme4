import { Room } from "colyseus.js";
import { GameState } from "../generated/GameState";
import GameScene from "../scenes/GameScene";
import { createLogger } from "../logger";
const log = createLogger("input");

export function initInput(scene: GameScene, room: Room<GameState>) {
  const { up, down, left, right, space } =
    scene.input.keyboard.createCursorKeys();

  let lastDirection = { up: false, down: false, left: false, right: false };
  let lastSprint = false;
  const updateListener = scene.events.on("update", () => {
    const curDirection = {
      up: up.isDown,
      down: down.isDown,
      left: left.isDown,
      right: right.isDown,
    };
    if (
      curDirection.left !== lastDirection.left ||
      curDirection.right !== lastDirection.right ||
      curDirection.down !== lastDirection.down ||
      curDirection.up !== lastDirection.up
    ) {
      lastDirection = curDirection;
      // TODO further optimize by only sending changed directions
      room.send("direction", curDirection);
      log("sent new direction %j", curDirection);
    }
    if (lastSprint !== space.isDown) {
      lastSprint = space.isDown;
      if (space.isDown) {
        log("sprinting");
        room.send("sprint", true);
      } else {
        log("stop sprinting");
        room.send("sprint", false);
      }
    }
  });
}
