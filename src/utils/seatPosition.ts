export function seatPosition(index: number, total: number, humanIndex: number, radiusPercent: number = 42) {
  const startAngle = Math.PI / 2 - ((2 * Math.PI) / total) * humanIndex;
  const angle = ((2 * Math.PI) / total) * index + startAngle;
  const x = 50 + radiusPercent * Math.cos(angle);
  const y = 50 + radiusPercent * Math.sin(angle);
  return { left: `${x}%`, top: `${y}%` };
}
