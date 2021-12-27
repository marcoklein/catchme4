import { GameObjects } from "phaser";

export default class HudScene extends Phaser.Scene {
  private energyText: GameObjects.Text;
  private pingText: GameObjects.Text;
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

    this.pingText = this.add.text(0, 0, "", {
      color: "white",
      fontSize: "14px",
    });
    this.pingText.setOrigin(0, 1);

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

  // private refreshPlayerStatsContainer() {
  //   let VERTICAL_OFFSET = 7;
  //   const HORIZONTAL_OFFSET = 7;
  //   const ENTRY_HEIGHT = 60;
  //   let statsWidth = 100;
  //   statsWidth += HORIZONTAL_OFFSET * 2;
  //   let statsHeight = 0;

  //   // create the player stats panel
  //   this.statsContainer.removeAll(true);

  //   // background graphics
  //   let backgroundGraphics = this.add.graphics();
  //   if (this.finished) {
  //     // use darker color if finished
  //     backgroundGraphics.fillStyle(0xdddddd, 0.9);
  //     statsWidth = this.gameFinishedText.width * (1 / 1.5) + 20;
  //     VERTICAL_OFFSET = this.gameFinishedText.height + 20;
  //     statsHeight += 20;
  //   } else {
  //     backgroundGraphics.fillStyle(0xdddddd, 0.7);
  //   }
  //   statsHeight += VERTICAL_OFFSET; // top and bottom offset
  //   statsHeight += this.gameScene.players.length * ENTRY_HEIGHT;

  //   backgroundGraphics.fillRect(0, 0, statsWidth, statsHeight);
  //   this.statsContainer.add(backgroundGraphics);

  //   let sortedPlayers = _.sortBy(this.gameScene.players, (player) => {
  //     return -player.score;
  //   });

  //   // player stats
  //   sortedPlayers.forEach((player, index) => {
  //     // get badge for player
  //     let badge = this.add.image(
  //       HORIZONTAL_OFFSET, // x
  //       VERTICAL_OFFSET + ENTRY_HEIGHT * index, // y
  //       "players", // texture
  //       player.animationPrefix + "_badge2"
  //     );
  //     badge.setDisplaySize(ENTRY_HEIGHT - 7, ENTRY_HEIGHT - 7);
  //     badge.setOrigin(0); // upper left corner

  //     // add text for points
  //     let statText = this.add.text(
  //       badge.getRightCenter().x + 10, // x
  //       badge.getRightCenter().y, // y
  //       "" + Math.round(player.score / 1000),
  //       { fontStyle: "bold", font: "18px Arial", fill: "#222" }
  //     );
  //     statText.setOrigin(0, 0.5);

  //     // add to container
  //     this.statsContainer.add(badge);
  //     this.statsContainer.add(statText);
  //   });
  // }

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
