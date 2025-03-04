import './App.css';
import {Routes, Route, /*Navigate*/} from "react-router-dom";
import Login from './components/login.jsx'
import Home from './components/home.jsx'

export function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/home' element={<Home/>} />
      </Routes>
    </>
  )
}

export default App
