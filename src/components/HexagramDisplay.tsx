import type { CastLine } from '../types'

interface Props {
  lines: CastLine[]       // lines cast so far, index 0 = bottom
  totalLines?: number     // how many lines exist (for spacing placeholder)
}

const LINE_H = 18
const LINE_GAP = 12
const BREAK_W = 14       // gap in yin line
const TOTAL = 6

export default function HexagramDisplay({ lines, totalLines = 6 }: Props) {
  const svgH = TOTAL * (LINE_H + LINE_GAP) - LINE_GAP + 4
  const W = 130

  return (
    <svg
      width={W}
      height={svgH}
      viewBox={`0 0 ${W} ${svgH}`}
      style={{ overflow: 'visible' }}
    >
      {Array.from({ length: TOTAL }).map((_, i) => {
        // Display bottom-to-top: line 0 at bottom, line 5 at top
        const y = svgH - LINE_H - i * (LINE_H + LINE_GAP)
        const castLine = lines[i]
        const isMoving = castLine && (castLine.value === 6 || castLine.value === 9)
        const isYang = castLine && (castLine.value === 7 || castLine.value === 9)
        const isYin = castLine && (castLine.value === 6 || castLine.value === 8)
        const revealed = !!castLine

        const color = revealed
          ? isMoving ? '#7ecf8a' : '#c8e0c4'
          : 'rgba(160,200,165,0.2)'

        return (
          <g key={i} className="fade-in" style={{ animationDelay: revealed ? '0ms' : undefined }}>
            {(!revealed || isYang) ? (
              // Yang line — solid
              <rect
                x={0} y={y} width={W} height={LINE_H}
                fill={color}
                rx={2}
                style={{ transition: 'fill 0.4s ease' }}
              />
            ) : (
              // Yin line — broken
              <>
                <rect x={0} y={y} width={(W - BREAK_W) / 2 - 2} height={LINE_H} fill={color} rx={2} />
                <rect x={(W + BREAK_W) / 2 + 2} y={y} width={(W - BREAK_W) / 2 - 2} height={LINE_H} fill={color} rx={2} />
              </>
            )}
            {/* Moving line markers */}
            {revealed && isMoving && (
              <text
                x={W + 10}
                y={y + LINE_H / 2 + 4}
                fontSize={10}
                fill="#7ecf8a"
                opacity={0.7}
                fontFamily="Cormorant Garamond, serif"
              >
                {castLine.value === 9 ? '○' : '×'}
              </text>
            )}
            {/* Placeholder lines (not yet cast) */}
            {!revealed && (
              <rect x={0} y={y} width={W} height={LINE_H} fill={color} rx={2} />
            )}
          </g>
        )
      })}
    </svg>
  )
}
