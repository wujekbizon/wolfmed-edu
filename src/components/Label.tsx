export default function Label(props: { label: string; htmlFor: string; className?: string }) {
  return (
    <label
      className={props.className ? `${props.className}` : `pb-1 text-sm text-muted-foreground`}
      htmlFor={props.htmlFor}
    >
      {props.label}
    </label>
  )
}
