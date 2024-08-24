import { Test } from '@/server/getData'

export default function TestsList(props: { tests: Test[] }) {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar-webkit">
      {/* {props.tests.map((test) => (
        <p key={test.data.question}>{test.category}</p>
      ))} */}
    </div>
  )
}
