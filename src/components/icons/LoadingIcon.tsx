export default function LoadingIcon({ color = '#302e2e', width = 24, height = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width={width + 5}
            height={height + 5}
            className="absolute animate-spin"
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="90"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
            />
        </svg>

    );
}
