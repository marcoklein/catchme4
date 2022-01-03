import { GameObjects } from "phaser";
import { millisToMinutesAndSeconds } from "../shared/milllis-to-minutes-and-seconds";

export default class HudScene extends Phaser.Scene {
  private energyText: GameObjects.Text;
  private totalGameTimeText: GameObjects.Text;
  private gameStatusText: GameObjects.Text;
  private remainingCatcherTimeText: GameObjects.Text;
  private statsContainer: Phaser.GameObjects.Container;
  gameFinishedText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "HudScene" });
  }

  async create() {
    this.energyText = this.add.text(0, 0, "", {
      color: "black",
      fontSize: "28px",
    });
    this.energyText.setOrigin(0, 0);
    this.remainingCatcherTimeText = this.add.text(0, 0, "", {
      color: "black",
      fontSize: "28px",
    });
    this.remainingCatcherTimeText.setOrigin(0.5, 0);
    this.gameStatusText = this.add.text(0, 0, "", {
      color: "black",
      fontSize: "28px",
    });
    this.gameStatusText.setOrigin(0.5, 0);

    this.totalGameTimeText = this.add.text(0, 30, "", {
      color: "black",
      fontSize: "28px",
    });
    this.totalGameTimeText.setOrigin(0, 0);

    this.gameFinishedText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 2,
      "Game Finished!",
      { font: "64px Arial", color: "#222" }
    );
    this.gameFinishedText.setOrigin(0.5, 0.5);
    this.gameFinishedText.alpha = 0;
    this.gameFinishedText.depth = 1000;

    this.statsContainer = this.add.container(10, 10);
    this.statsContainer.scale = 1;
  }

  updateEnergy(energy?: number, maxEnergy?: number) {
    if (energy === undefined || maxEnergy === undefined) {
      this.energyText.setVisible(false);
      return;
    }
    this.energyText.setVisible(true);
    this.energyText.setText(
      `Energy: ${Math.floor(energy)}/${Math.floor(maxEnergy)}`
    );
  }

  updateRemainingTimeText(millis: number) {
    this.totalGameTimeText.setVisible(millis >= 0);
    if (this.totalGameTimeText.visible) {
      const { seconds, minutes } = millisToMinutesAndSeconds(millis);
      this.totalGameTimeText.setText(
        `Time: ${Math.floor(minutes)}:${new String(
          Math.floor(seconds)
        ).padStart(2, "0")}`
      );
    }
  }

  updateGameStatusText(text?: string) {
    if (!text) this.gameStatusText.setVisible(false);
    else {
      this.gameStatusText.setVisible(true);
      this.gameStatusText.setText(text);
      this.gameStatusText.setX(this.cameras.main.displayWidth / 2);
    }
  }
}
