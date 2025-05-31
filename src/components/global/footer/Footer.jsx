import './footer.css'
// import { SecondaryLogo } from '../../../assets/assets'

export default function Footer() {
    return (
        <div className='footer__container'>
            <div className='footer__logo--container'>
                <img src="/images/exact-3d-design-icon.png" alt="Exact 3D Logo" className="footer__image" />
                <div className='footer__info--container'>
                    <div className='footer__address--container'>
                        <h2>
                            Email
                        </h2>
                        <p>
                            bill@exact3design.com
                        </p>
                    </div>

                    <div className='footer__service--container'>
                        <h2>
                            Service Locations
                        </h2>
                        <p>
                            All of Delaware, Eastern Maryland, Southeastern Pennsylvania.
                        </p>
                    </div>
                    <div className='footer__service--container'>
                        <h2>
                            Industries We Serve
                        </h2>
                        <p>
                            Product Design & Development
                        </p>
                        <p>
                            Architecture & Construction
                        </p>
                        <p>
                            Automotive & Mechanical
                        </p>
                        <p>
                            Education & Research
                        </p>
                        <p>
                            Art, Fashion & Custom Goods
                        </p>
                    </div>
                </div>
            </div>
            <div className='footer__bottom--container'>
                <h2 className='footer__subheader'>Created with passion by <a target="_blank" rel="noopener noreferrer" href='https://websiteartificers.com'>Website Artificers</a> © 2025</h2>
            </div>
        </div>
    )
}