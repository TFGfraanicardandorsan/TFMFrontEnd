import './App.css';
import {Routes, Route, /*Navigate*/} from "react-router-dom";
import Login from './components/login.jsx'

export function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>} />
      </Routes>
    </>
  )
}

export default App
