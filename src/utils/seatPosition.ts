/**
 * Computes CSS position for a player seat around a circular table.
 * Seats are evenly spaced, with the human player anchored at the bottom.
 *
 * @param index     - Seat index (0-based)
 * @param total     - Total number of players
 * @param humanIndex - Index of the human player (placed at bottom-centre)
 * @param radiusPercent - Distance from centre as a percentage of the container
 * @returns {left, top} CSS values for absolute positioning
 */
export function seatPosition(index: number, total: number, humanIndex: number, radiusPercent: number = 42) {
  // Rotate so the human sits at the bottom (π/2 = 6 o'clock)
  const startAngle = Math.PI / 2 - ((2 * Math.PI) / total) * humanIndex;
  const angle = ((2 * Math.PI) / total) * index + startAngle;
  const x = 50 + radiusPercent * Math.cos(angle);
  const y = 50 + radiusPercent * Math.sin(angle);
  return { left: `${x}%`, top: `${y}%` };
}
