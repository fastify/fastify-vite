import { Link } from 'react-router-dom'

export function getServerSideProps () {
	return {
		todoList: [
      'Do laundry',
      'Respond to emails',
      'Write report',
    ]
	}
}

export default function NestedIndex ({ todoList }) {
	return (
	  <>
	    <ul>{
	      (todoList || []).map((item, i) => {
	        return <li key={`item-${i}`}>{item}</li>
	      })
	    }</ul>
	    <p>
	      <Link to="/other">Go to another page</Link>
	    </p>
	  </>
	)
}