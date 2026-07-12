export function getTimelinePosition(
  timestampSeconds: number | null,
  duration: number | null,
): number | null {
  if (duration === null || duration <= 0) {
    return null;
  }

  if (
    timestampSeconds === null ||
    timestampSeconds < 0 ||
    timestampSeconds > duration
  ) {
    return null;
  }

  return (timestampSeconds / duration) * 100;
}
