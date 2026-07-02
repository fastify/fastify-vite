export function getMeta() {
  return {
    title: 'RSC e2e - Home',
  }
}

export default function Index() {
  return (
    <div>
      <h1>RSC e2e - Home</h1>
      <p>This is a non-RSC page (mixed mode test)</p>
      <nav>
        <ul>
          <li>
            <a href="/rsc-page">RSC Page</a>
          </li>
          <li>
            <a href="/rsc-client">RSC Client</a>
          </li>
          <li>
            <a href="/actions">RSC Actions</a>
          </li>
          <li>
            <a href="/error">RSC Error</a>
          </li>
          <li>
            <a href="/auth-page">Auth Page</a>
          </li>
          <li>
            <a href="/data-action">Data Action</a>
          </li>
          <li>
            <a href="/using-data">Using Data</a>
          </li>
          <li>
            <a href="/using-store">Using Store</a>
          </li>
          <li>
            <a href="/streaming">Streaming</a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
