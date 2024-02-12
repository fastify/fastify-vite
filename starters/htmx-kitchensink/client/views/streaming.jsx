
export const path = '/streaming'

import Message from '/components/Message.jsx'

export const streaming = true

export default function () {
	return (
	  <>
	    <Message secs={2} />
	    <Message secs={4} />
	    <Message secs={6} />
	  </>
	)
}
