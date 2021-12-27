import { Bodies, Engine, World } from "matter-js";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";
import { GameState, Texture, Tile, TileMap } from "../schema/GameState";

const textures = {
  grass: () => new Texture("tilesheet.grass", 0),
  wall: () => new Texture("tile.wall.1"),
  dirt: () => new Texture("tile.dirt"),
  tree: () => new Texture("tile.tree"),
};

export function createTileMap() {
  const tileMap = new TileMap();
  tileMap.mapSize.width = 15;
  tileMap.mapSize.height = 10;
  tileMap.tileSize = 64;
  for (let i = 0; i < tileMap.mapSize.width * tileMap.mapSize.height; i++) {
    const ran = Math.random();
    if (ran < 0.05) {
      const tile = new Tile(textures.wall());
      const x = i % tileMap.mapSize.width;
      const y = Math.floor(i / tileMap.mapSize.width);
      tile.position.x = x;
      tile.position.y = y;
      tile.walkable = false;
      tile.type = "wall";
      tileMap.tiles.set(`${tile.position.x};${tile.position.y}`, tile);
    } else {
      const tile = new Tile(textures.dirt());
      const x = i % tileMap.mapSize.width;
      const y = Math.floor(i / tileMap.mapSize.width);
      tile.position.x = x;
      tile.position.y = y;
      tile.type = "grass";
      tileMap.tiles.set(`${tile.position.x};${tile.position.y}`, tile);
    }
  }

  for (let i = 0; i < tileMap.mapSize.width * tileMap.mapSize.height; i++) {
    const x = i % tileMap.mapSize.width;
    const y = Math.floor(i / tileMap.mapSize.width);
    if (Math.random() < 0.05 && tileMap.getTileAt(x, y)?.walkable) {
      const tile = new Tile(textures.tree());
      tile.position.x = x;
      tile.position.y = y;
      tile.walkable = true;
      tile.layer = 110;
      // FIXME refactor tile map ids to not include layer
      // otherwise, we won't be able to identify a tile by this id => we would need to now
      // the layer of a tile when looking for it
      // eg. introduce only two layers or place array of textures into tile schema
      tileMap.tiles.set(
        `${tile.position.x};${tile.position.y};${tile.layer}`,
        tile
      );
    }
  }
  return tileMap;
}

export class CreateTileMap implements GameController {
  attachToRoom(room: GameRoom, state: GameState) {
    const tileMap = createTileMap();

    state.tileMap = tileMap;

    const tileWorldX =
      -tileMap.mapSize.width * tileMap.tileSize * 0.5 + tileMap.tileSize / 2;
    const tileWorldY =
      -tileMap.mapSize.height * tileMap.tileSize * 0.5 + tileMap.tileSize / 2;
    state.tileMap.tiles.forEach((tile) => {
      if (tile.walkable) return;
      World.add(
        room.engine.world,
        Bodies.rectangle(
          tileWorldX + tile.position.x * tileMap.tileSize,
          tileWorldY + tile.position.y * tileMap.tileSize,
          tileMap.tileSize,
          tileMap.tileSize,
          {
            isStatic: true,
          }
        )
      );
    });
    this.createWorldBoundaries(
      room.engine,
      tileMap.mapSize.width * tileMap.tileSize,
      tileMap.mapSize.height * tileMap.tileSize
    );
  }

  private createWorldBoundaries(
    engine: Engine,
    width: number,
    height: number,
    thickness = 100
  ) {
    const x = -width / 2,
      y = -height / 2;
    World.add(engine.world, [
      Bodies.rectangle(
        x - thickness + (width + 2 * thickness) / 2,
        y - thickness / 2,
        width + 2 * thickness,
        thickness,
        {
          isStatic: true,
        }
      ),
      Bodies.rectangle(
        x + width + thickness / 2,
        y + height / 2,
        thickness,
        height,
        { isStatic: true }
      ),
      Bodies.rectangle(
        x - thickness + (width + 2 * thickness) / 2,
        y + height + thickness / 2,
        width + 2 * thickness,
        thickness,
        { isStatic: true }
      ),
      Bodies.rectangle(x - thickness / 2, y + height / 2, thickness, height, {
        isStatic: true,
      }),
    ]);
  }
}
