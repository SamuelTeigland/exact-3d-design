import './who.css'

export default function Who() {
    return (
        <div className='who__container'>
            <div className='who__subcontainer'>
                <h1 className='who__header'>Who <span>We</span> Are</h1>
                <p className="who__paragraph">
                    At Exact 3D Design, we specialize in transforming concepts into detailed, accurate 3D models. We are dedicated to delivering high-quality 3D design solutions tailored to meet the unique needs of each client.
                </p>
                <p className="who__paragraph">
                    Whether you're in engineering, construction, or manufacturing, we provide the expertise and technology to bring your visions to life.
                </p>
                <a className='who__link'>
                    <button className="who__button button__primary">Contact Us</button>
                </a>
            </div>
            <div className='who__subcontainer'>
                <img src="/images/bill-sahm-blue-headshot.png" alt="Headshot of Bill Sahm" className="who__image" />
                <p className='who__paragraph--founder'>Founder</p>
                <h2 className="who__header--founder">Bill Sahm</h2>
            </div>
        </div>
    )
}