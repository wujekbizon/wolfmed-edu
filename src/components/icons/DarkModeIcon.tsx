export default function DarkModeIcon({ color = '#302e2e', width = 24, height = 24 }) {
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
        <path
          d="M21 12.79C20.44 12.93 19.85 13 19.25 13C14.43 13 10.5 9.07 10.5 4.25C10.5 3.65 10.57 3.06 10.71 2.5C6.88 3.57 4 7.01 4 11C4 15.97 8.03 20 13 20C16.99 20 20.43 17.12 21.5 13.29C21.34 13.13 21.18 12.96 21 12.79Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  