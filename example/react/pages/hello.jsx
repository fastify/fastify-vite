import { useState, useEffect, useContext } from 'react'
import { Context } from '../context'


export default function Hello(props) {  
  const { context } = useContext(Context);
  console.log('props', props)
  console.log('context', context)
  let [msg, setMsg] = useState(context?.$data?.message);
 
  const refreshData = async () => {
    const response = await fetch(context.$dataPath())
    const json = await response.json()
    setMsg(json.message)
  }

  useEffect(() => {
    if (!msg && !import.meta.env.SSR) {
      refreshData();
    }
  })

  return <h1 onClick={refreshData}>{msg}</h1>

}