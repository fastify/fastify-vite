export default async function ({ secs }) {
	const message = await afterSeconds({
  	message: 'Delayed as an asynchronous component',
  	seconds: secs
  })
	return (
		<p>{message}</p>
	)
}

function afterSeconds ({ message, seconds }) {
  return new Promise((resolve) => {
    setTimeout(() => {
    	resolve(message)
    }, seconds * 1000)
  })
}
