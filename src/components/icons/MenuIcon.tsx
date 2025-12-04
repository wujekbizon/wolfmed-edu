export default function MenuIcon(props: { onClick?: React.MouseEventHandler<SVGSVGElement> | undefined }) {
  return (
    <svg
      className="relative h-9 w-9 cursor-pointer inline-block lg:hidden "
      width="28px"
      height="28px"
      viewBox="0 0 24 24"
      fill="none"
      onClick={props.onClick}
    >
      <g className="transition-all">
        <path
          d="M4 17H8M12 17H20M4 12H20M4 7H12M16 7H20"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#f58a8a"
          fillOpacity=".16"
          stroke="#f58a8a"
          strokeMiterlimit="40"
          className="animate-pulse"
        />
      </g>
    </svg>
  )
}
