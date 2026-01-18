import React from 'react'
import { Navbar, Footer, ProductDetail, ProductList } from './components/components.js'
import { Home, About, Services, Contact, OurWork, SetUp, Token } from './pages/pages.js'
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
        <Route exact path="/product" element={<ProductList />} />
        <Route exact path="/product/:slug" element={<ProductDetail />} />
        <Route exact path="/setup" element={<SetUp />} />
        <Route exact path="/v/:token" element={<Token />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
