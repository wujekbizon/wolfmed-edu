export default function CloseIcon(props: { onClick?: React.MouseEventHandler<SVGSVGElement> | undefined }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative h-9 w-9 cursor-pointer "
      onClick={props.onClick}
    >
      <g className="stroke-white transition-all hover:stroke-[#f58a8a]/80">
        <path
          d="M18.6 3H5.4A2.4 2.4 0 0 0 3 5.4v13.2A2.4 2.4 0 0 0 5.4 21h13.2a2.4 2.4 0 0 0 2.4-2.4V5.4A2.4 2.4 0 0 0 18.6 3Z"
          fill="#ffffff"
          fillOpacity=".16"
          stroke="#616060"
          strokeWidth="1"
          strokeMiterlimit="10"
          className="before:content[''] animate-pulse fill-[#f58a8a] before:absolute before:left-0 before:top-0 before:block before:h-full before:w-full before:rounded-full before:opacity-0 before:transition-opacity "
        />
        <path
          d="m7.757 16.243 8.486-8.486M16.243 16.243 7.757 7.757"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
