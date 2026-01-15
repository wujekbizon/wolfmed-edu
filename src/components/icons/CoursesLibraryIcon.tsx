export default function CoursesIcon({ color = '#302e2e', width = 24, height = 24 }) {
  return (
<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color={color}
      fill="none"
      className="w-8 min-w-8 stroke-inherit stroke-[0.75]"
    >
      <rect
        x="2"
        y="3"
        width="6"
        height="18"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="9.5"
        y="3"
        width="6"
        height="18"
        rx="1"
        strokeWidth="1"
      />
      <rect
        x="17.5"
        y="3"
        width="6"
        height="18"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M5.5 8H5.5M12 8H12M18.5 8H18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}