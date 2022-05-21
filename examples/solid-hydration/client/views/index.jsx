export default function Index ({ data }) {
  return (
    <>
      <ul>{
        data.todoList.map((item, i) => {
          return <li>{item}</li>
        })
      }</ul>
    </>
  )
}

// import React, { useRef } from 'react'
// import { Link } from 'react-router-dom'
// import { useAtom } from 'jotai'

// export default function Index (props) {
//   const [state, updateState] = useAtom(todoList)
//   const input = useRef(null)
//   const addItem = async () => {
//     updateState((todoList) => {
//       return [...todoList, input.current.value]
//     })
//     input.current.value = ''
//   }
//   return (
//     <>
//       <ul>{
//         state.map((item, i) => {
//           return <li key={`item-${i}`}>{item}</li>
//         })
//       }</ul>
//       <div>
//         <input ref={input} />
//         <button onClick={addItem}>Add</button>
//       </div>
//       <p>
//         <Link to="/other">Go to another page</Link>
//       </p>
//     </>
//   )
// }
