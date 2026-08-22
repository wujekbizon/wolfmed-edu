export default function DiagnozyIcon({ color = '#302e2e', width = 24, height = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color={color}
      fill={'none'}
      className="w-8 min-w-8 stroke-inherit stroke-[0.75]"
    >
      <path
        d="M16 2V4M8 2V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 3.5C20.1046 3.5 21 4.39543 21 5.5V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V5.5C3 4.39543 3.89543 3.5 5 3.5H19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H12M7 16H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 16.5C13.5 16.5 14.5 17 15.25 18C15.25 18 16.5 15 19 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5V7.5M10 5.5H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
