export default function Label(props: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label
      className={props.className ? `${props.className}` : `pb-1 text-sm text-muted-foreground`}
      htmlFor={props.htmlFor}
    >
      {props.label}
      {props.children}
    </label>
  )
}
