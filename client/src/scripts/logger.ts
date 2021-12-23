import Debug from "debug";
Debug.enable("*");

export function createLogger(namespace: string) {
  return Debug(`game:${namespace}`);
}
