import React from 'react'
import { Navbar, Footer } from './components/components.js'
import { Home } from './pages/pages.js'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


function App() {

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route exact path="/" element={<Home />} />
        </Routes>
      <Footer />
    </Router>
  )
}

export default App
