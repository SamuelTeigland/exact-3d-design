import './ourServices.css'

export default function OurServices() {
    return (
        <div className='ourServices__container'>
            <section className="ourServices__hero">
                <div className="ourServices__subcontainer">
                    <h2>Custom <span>3D Printing & Design</span> Services</h2>
                    <p>Serving Delaware, Maryland, Pennsylvania, and South New Jersey</p>
                </div>
            </section>

            <section className="ourServices__body">
                <div className="ourServices__card">
                    <h3>Custom 3D Printing</h3>
                    <p>Bring your ideas to life with high-quality, precision 3D printing in a variety of materials including PLA, ABS, PETG, and more.</p>
                </div>

                <div className="ourServices__card">
                    <h3>3D Product Design</h3>
                    <p>Create functional and visually stunning models tailored to your specific needs—from prototypes to final products.</p>
                </div>

                <div className="ourServices__card">
                    <h3>Prototyping & Iteration</h3>
                    <p>We help businesses and inventors prototype quickly and iterate efficiently, accelerating product development.</p>
                </div>

                <div className="ourServices__card">
                    <h3>CAD Modeling</h3>
                    <p>We turn sketches and concepts into detailed CAD files ready for printing or production using industry-standard software.</p>
                    </div>
            </section>

            <section className="ourServices__cta">
                <div className="ourServices__subcontainer">
                    <h2>Let’s Build Something Amazing</h2>
                    <p>Whether you need a one-off model or ongoing production support, Exact 3D Design is here to help.</p>
                    <a target="_blank" to='https://shop.exact3design.com/' className="ourServices__link">
                        <button className="ourServices__button button__tertiary">Get a Quote</button>
                    </a>
                </div>
            </section>
        </div>
    )
}