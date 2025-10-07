import Checkbox from "./Checkbox"

export function PinnedCheckbox({
  pinned,
  onChange,
}: {
  pinned: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <>
      <Checkbox id="pinned" label="Przypięta notatka" checked={pinned} onChange={onChange} />
      <input type="hidden" name="pinned" value={String(pinned)} />
    </>
  )
}