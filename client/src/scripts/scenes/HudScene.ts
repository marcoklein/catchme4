import { GameObjects } from "phaser";

export default class HudScene extends Phaser.Scene {
  private energyText: GameObjects.Text;
  private pingText: GameObjects.Text;
  constructor() {
    super({ key: "HudScene" });
  }

  async create() {
    this.energyText = this.add.text(0, 0, "", {
      color: "black",
      fontSize: "28px",
    });
    this.energyText.setOrigin(0, 0);

    this.pingText = this.add.text(0, 0, "", {
      color: "white",
      fontSize: "14px",
    });
    this.pingText.setOrigin(0, 1);
  }

  updateEnergy(energy: number, maxEnergy: number) {
    this.energyText.setText(
      `Energy: ${Math.floor(energy)}/${Math.floor(maxEnergy)}`
    );
  }

  updatePing(ping: number, connectionText: string) {
    this.pingText.setText(`Ping: ${ping} (${connectionText})`);
    this.pingText.setPosition(0, this.cameras.main.height);
  }
}
