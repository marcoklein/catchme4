import { TileMap, Tile, Texture } from "./schema/GameState";

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
