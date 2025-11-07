export default function ArrowUpIcon({ color = '#302e2e', width = 24, height = 24 }) {
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
          d="M12 19V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 12L12 5L19 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }