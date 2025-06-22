import React from 'react'
import { Navbar, Footer } from './components/components.js'
import { Home, About, Services, Contact, OurWork } from './pages/pages.js'
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
          <Route exact path="/about" element={<About />} />
          <Route exact path='/services' element={<Services />} />
          <Route exact path="/contact" element={<Contact />} />
          <Route exact path="/our-work" element={<OurWork />} />
        </Routes>
      <Footer />
    </Router>
  )
}

export default App
