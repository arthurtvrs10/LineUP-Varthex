function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const WIDTH = 1200;
const HEIGHT = 620;
const CELL = 80;

function buildGrid(width: number, height: number, cell: number, seed: number) {
  const random = createRandom(seed);
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;

  const verticalLines = Array.from({ length: cols }, (_, i) => i * cell);
  const horizontalLines = Array.from({ length: rows }, (_, i) => i * cell);

  const nodes = verticalLines.flatMap((x) =>
    horizontalLines.map((y) => ({
      x,
      y,
      accent: random() < 0.1,
      r: random() < 0.1 ? 3.2 : 2,
    })),
  );

  return { verticalLines, horizontalLines, nodes };
}

export function ConstellationBackground({ className = "" }: { className?: string }) {
  const { verticalLines, horizontalLines, nodes } = buildGrid(WIDTH, HEIGHT, CELL, 42);

  return (
    <svg
      aria-hidden
      className={className}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMin slice"
    >
      <g stroke="#9aa3ba" strokeOpacity={0.35} strokeWidth={1}>
        {verticalLines.map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={HEIGHT} />
        ))}
        {horizontalLines.map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={WIDTH} y2={y} />
        ))}
      </g>
      <g>
        {nodes.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.accent ? "#2563eb" : "#9aa3ba"}
            fillOpacity={node.accent ? 0.6 : 0.55}
          />
        ))}
      </g>
    </svg>
  );
}
