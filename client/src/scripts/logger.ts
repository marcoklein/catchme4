import Debug from "debug";
Debug.enable("*,-game:ping");

export function createLogger(namespace: string) {
  return Debug(`game:${namespace}`);
}
