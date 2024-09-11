export default function MenuIcon(props: { onClick?: React.MouseEventHandler<SVGSVGElement> | undefined }) {
  return (
    <svg
      className="relative h-9 w-9 cursor-pointer inline-block lg:hidden"
      width="28px"
      height="28px"
      viewBox="0 0 24 24"
      fill="none"
      onClick={props.onClick}
    >
      <g className="stroke-[#ffc5c5]/50 transition-all hover:stroke-[#f58a8a]/80">
        <path
          d="M4 17H8M12 17H20M4 12H20M4 7H12M16 7H20"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#ffffff"
          fillOpacity=".16"
          stroke="#ffffff"
          strokeMiterlimit="10"
          className="before:content[''] animate-pulse fill-[#f58a8a] before:absolute before:left-0 before:top-0 before:block before:h-full before:w-full before:rounded-full before:opacity-0 before:transition-opacity "
        />
      </g>
    </svg>
  )
}
