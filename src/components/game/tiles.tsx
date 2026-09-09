/** Breakfast and fruit tiles drawn to match the Figma boards, not emoji. */

export function BreakfastTile({ kind }: { kind: number }) {
  switch (kind % 7) {
    case 0:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <rect x="10" y="12" width="44" height="40" rx="6" fill="#e8b45a" />
          <rect x="14" y="16" width="36" height="32" rx="4" fill="#f3d48a" />
          <rect x="18" y="22" width="10" height="8" rx="2" fill="#d49a3a" opacity="0.45" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="36" r="18" fill="#e23d3d" />
          <ellipse cx="24" cy="30" rx="5" ry="3" fill="#fff" opacity="0.35" />
          <path d="M28 18c0-6 8-8 10-2 2 2-2 6-6 8" fill="#3aa33a" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <ellipse cx="32" cy="36" rx="22" ry="18" fill="#fff6e8" />
          <ellipse cx="32" cy="36" rx="10" ry="9" fill="#ffd23a" />
          <ellipse cx="28" cy="32" rx="3" ry="2" fill="#fff" opacity="0.55" />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <ellipse cx="32" cy="42" rx="18" ry="8" fill="#d4a04a" />
          <ellipse cx="32" cy="34" rx="18" ry="8" fill="#e8b45a" />
          <ellipse cx="32" cy="26" rx="18" ry="8" fill="#f3c96a" />
          <rect x="26" y="22" width="12" height="8" rx="2" fill="#ffe56a" />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <path d="M20 22h24v28c0 6-4 10-12 10s-12-4-12-10V22Z" fill="#c45ad4" />
          <rect x="18" y="16" width="28" height="10" rx="3" fill="#f4b6d2" />
          <path d="M18 20h28" stroke="#fff" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
      )
    case 5:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <path
            d="M18 22c2 6 4 20 2 28m12-30c2 8 3 22 0 30m12-28c3 8 4 20 1 28"
            stroke="#c44a3a"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M18 22c2 6 4 20 2 28m12-30c2 8 3 22 0 30m12-28c3 8 4 20 1 28"
            stroke="#f2a090"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <path
            d="M14 40c4-14 32-18 38-4-8 14-34 16-38 4Z"
            fill="#c4783a"
          />
          <ellipse cx="22" cy="36" rx="4" ry="3" fill="#e8b080" />
        </svg>
      )
  }
}

function Face({ cx, cy, happy = false }: { cx: number; cy: number; happy?: boolean }) {
  return happy ? (
    <>
      <path d={`M${cx - 7} ${cy - 2}c2-3 5-3 7 0`} stroke="#241c33" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 5} ${cy - 2}c2-3 5-3 7 0`} stroke="#241c33" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx} ${cy + 8}c3 3 8 3 11 0`} stroke="#241c33" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ) : (
    <>
      <circle cx={cx - 5} cy={cy} r="3.2" fill="#241c33" />
      <circle cx={cx + 7} cy={cy} r="3.2" fill="#241c33" />
      <circle cx={cx - 4} cy={cy - 1} r="1" fill="#fff" />
      <circle cx={cx + 8} cy={cy - 1} r="1" fill="#fff" />
      <path d={`M${cx - 2} ${cy + 8}c3 4 9 4 12 0`} fill="#241c33" />
    </>
  )
}

export function FruitTile({ kind }: { kind: number }) {
  switch (kind % 7) {
    case 0:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="36" r="18" fill="#ff9db8" />
          <ellipse cx="24" cy="30" rx="4" ry="2.5" fill="#fff" opacity="0.45" />
          <path d="M28 50c6 6 14 2 16-4" fill="#5cbc4a" />
          <Face cx={30} cy={36} />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="34" r="18" fill="#ff8a1a" />
          <ellipse cx="24" cy="28" rx="4" ry="2.5" fill="#fff" opacity="0.4" />
          <path d="M32 16c2 4 0 8-4 8" stroke="#4aa33a" strokeWidth="3" fill="none" />
          <Face cx={30} cy={34} happy />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="36" r="16" fill="#3d8bff" />
          <ellipse cx="25" cy="30" rx="3.5" ry="2" fill="#fff" opacity="0.4" />
          <path d="M32 20c0-5 6-6 6-1" stroke="#2a5fd4" strokeWidth="3" fill="none" />
          <Face cx={30} cy={36} />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="36" r="16" fill="#9b5bff" />
          <ellipse cx="25" cy="30" rx="3.5" ry="2" fill="#fff" opacity="0.4" />
          <path d="M32 20c0-5 6-6 6-1" stroke="#5cbc4a" strokeWidth="3" fill="none" />
          <Face cx={30} cy={36} />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <path d="M32 14c12 8 18 22 14 34-12 8-24 6-28-4C12 30 20 18 32 14Z" fill="#ff3d5a" />
          <path d="M32 14c-8 2-12 8-10 12 6-2 12-4 16-2-2-6-4-10-6-10Z" fill="#5cbc4a" />
          <Face cx={30} cy={36} />
        </svg>
      )
    case 5:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="36" r="18" fill="#7ed321" />
          <ellipse cx="24" cy="30" rx="4" ry="2.5" fill="#fff" opacity="0.4" />
          <path d="M32 16c2 5-2 8-6 7" stroke="#8a5a2a" strokeWidth="3" fill="none" />
          <Face cx={30} cy={36} happy />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 64 64" aria-hidden>
          <ellipse cx="32" cy="40" rx="14" ry="16" fill="#ffd23a" />
          <path d="M24 28h16l-2 8H26Z" fill="#f0c020" />
          <path d="M32 10c4 6 8 10 0 16-8-6-4-10 0-16Z" fill="#3aa33a" />
          <Face cx={30} cy={40} happy />
        </svg>
      )
  }
}
