import React, { useEffect } from "react"
import convert from "./lib/convert"

const App = () => {
  convert()

  useEffect(() => {
    convert().then(data => console.log(data))
  }, [])

  return <h1>working</h1>
}

export default App
