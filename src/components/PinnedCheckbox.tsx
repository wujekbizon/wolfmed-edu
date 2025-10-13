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
      <input type="hidden" name="pinned" value={String(pinned)} />
      <Checkbox id="pinned" label="Przypięta notatka" checked={pinned} onChange={onChange} />
    </>
  )
}