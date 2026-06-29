'use client'
import { useState } from 'react'
import { getServerData } from '../actions/data.js'

export function ServerDataButton() {
  const [data, setData] = useState(null)

  const handleClick = async () => {
    const result = await getServerData()
    setData(result)
  }

  return (
    <div>
      <button onClick={handleClick}>Fetch Server Data</button>
      {data && (
        <output>
          <p>{data.message}</p>
          <p>Timestamp: {data.timestamp}</p>
        </output>
      )}
    </div>
  )
}
