export default function CourseLibraryIcon({
    color = '#302e2e',
    width = 24,
    height = 24,
  }) {
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
        {/* Back card */}
        <rect
          x="4"
          y="5"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.4"
        />
  
        {/* Middle card */}
        <rect
          x="3"
          y="6.5"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.7"
        />
  
        {/* Front card */}
        <rect
          x="2"
          y="8"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
  
        {/* Play icon */}
        <path
          d="M8.5 11.5L12.5 13.5L8.5 15.5V11.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  