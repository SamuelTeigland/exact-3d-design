import './hero.css'
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <div className='hero__container'>
            <h2 className='hero__header'>
                Precision in Every Layer. <span>Innovation in Every Design.</span>
            </h2>
            <p className='hero__paragraph'>Custom 3D Printing & Design Services <span>That Bring Your Ideas to Life.</span></p>
            <div className='hero__button--container'>
                <Link className='hero__link'
                to='http://exact3design.3dlayers.app/'>
                    <button className='button__secondary hero__button'>Get a quote!</button>
                </Link>
                <Link className='hero__link'
                to='/our-work'>
                    <button className='button__tertiary hero__button'>Our work</button>
                </Link>
            </div>
        </div>
    )
}