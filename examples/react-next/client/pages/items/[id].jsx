import React from 'react'

export function getServerSideProps () {
	return {
		todoList: [
      'Do laundry',
      'Respond to emails',
      'Write report',
    ]
	}
}

export default function () {
	return <p>/views/items/[id].jsx</p>
}