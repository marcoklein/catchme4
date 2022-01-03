import { Texture } from "../generated/Texture";

/**
 * Util function to access frame key of Texture schema.
 *
 * @param texture
 * @returns
 */
export function getTextureFrameKey(texture: Texture) {
  if (texture.frameKey.length) {
    return texture.frameKey;
  } else if (texture.frameIndex >= 0) {
    return texture.frameIndex;
  }
  return undefined;
}
