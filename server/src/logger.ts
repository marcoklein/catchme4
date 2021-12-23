import Debug from "debug";
Debug.enable(process.env.DEBUG || "");

export function createLogger(namespace: string) {
  return Debug(`game:${namespace}`);
}
