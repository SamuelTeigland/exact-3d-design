import './services.css'

export default function Services() {
    return (
        <div className='services__container'>
            <h2 className='services__header'>SERVICES</h2>
            <p className="services__paragraph">We offer a <span>comprehensive suite</span> of 3D design services.</p>
            <div className='services__subcontainer'>
                <div className='services__icon--container'>
                    <h3 className='services__icon--header'>3D Modeling and Visualization</h3>
                    <p className='services__icon--paragraph'>Creating detailed models for architectural designs, product prototypes, and more.</p>
                </div>
                <div className='services__icon--container'>
                    <h3 className='services__icon--header'>CAD Drafting</h3>
                    <p className='services__icon--paragraph'>Providing precise technical drawings for engineering and construction projects.</p>
                </div>
                <div className='services__icon--container'>
                    <h3 className='services__icon--header'>BIM (Building Information Modeling)</h3>
                    <p className='services__icon--paragraph'>Developing intelligent 3D models that facilitate planning, design, and construction processes.</p>
                </div>
                <div className='services__icon--container'>
                    <h3 className='services__icon--header'>3D Rendering</h3>
                    <p className='services__icon--paragraph'>Producing photorealistic images to help clients visualize the final product.</p>
                </div>
            </div>
        </div>
    )
}