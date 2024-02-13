export default async function () {
	const message = await afterSeconds({
  	message: 'Delayed as an asynchronous component',
  	seconds: 3
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
