import './navbar.css'
import { Hamburger } from '../../.././assets/assets';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [ isVisible, setVisible ] = useState(false);

    return (
        <div className='navbar'>
            <div className='navbar__container'>
                <a href='/' className='navbar__logo--container'>
                    <img src="/images/3d-printing-main-logo.png" alt="Exact 3D Design Logo" className="navbar__image" />
                </a>
                <div className='navbar__link--container'>
                    <Link to='/about'>
                        About
                    </Link>
                    <Link to='/services'>
                        Our Services
                    </Link>
                    <Link to='/'>
                        Our Work
                    </Link>
                    <Link to="/">
                        Blog
                    </Link>
                    <Link to="/contact">
                        Contact Us
                    </Link>
                    <Link to='/contact'>
                        <button className='button__secondary navbar__button'>
                            Get a quote!
                        </button>
                    </Link>
                    <div className='hamburger__container' onClick={
                        () => {
                            setVisible(!isVisible);
                        }
                    }>
                        <Hamburger />
                    </div>
                </div>
            </div>
            <div className={ isVisible === true ? 'hamburger__link--container shown__menu' : 'hamburger__link--container hidden__menu' }>
                <Link to='/about' onClick={ () => { setVisible(!isVisible); } }>
                    About
                </Link>
                <Link to='/services' onClick={ () => { setVisible(!isVisible); } }>
                    Our Services
                </Link>
                <Link to='/' onClick={ () => { setVisible(!isVisible); } }>
                    Our Work
                </Link>
                <Link to="/" onClick={ () => { setVisible(!isVisible); } }>
                    Blog
                </Link>
                <Link to="/contact" onClick={ () => { setVisible(!isVisible); } }>
                    Contact Us
                </Link>
                <Link id='navbar__special--link' to='/contact' onClick={ () => { setVisible(!isVisible); } }>
                    Get a quote!
                </Link>

            </div>
        </div>
    )
}