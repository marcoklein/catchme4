export function millisToMinutesAndSeconds(millis: number) {
  const totalSeconds = millis / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  return { seconds: Math.floor(totalSeconds % 60), minutes };
}
