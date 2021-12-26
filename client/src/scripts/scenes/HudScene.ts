import { GameObjects } from "phaser";

export default class HudScene extends Phaser.Scene {
  private energyText: GameObjects.Text;
  constructor() {
    super({ key: "HudScene" });
  }

  async create() {
    this.energyText = this.add.text(0, 0, "", {
      color: "black",
      fontSize: "28px",
    });
    this.energyText.setOrigin(0, 0);
  }

  updateEnergy(energy: number, maxEnergy: number) {
    this.energyText.setText(
      `Energy: ${Math.floor(energy)}/${Math.floor(maxEnergy)}`
    );
  }
}
