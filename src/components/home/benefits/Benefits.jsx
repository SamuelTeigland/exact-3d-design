import "./benefits.css";

export default function Benefits() {
    return (
        <div className="benefits__container">
            <h3 className="benefits__subheader">BENEFITS</h3>
            <h2 className="benefits__header">It's <span>you're one stop shop</span> for 3D design.</h2>
            <p className="benefits__paragraph">
                EX3D provides a boutique 3D design experience for individuals and businesses. <span>If you can think it, we can make it.</span>
            </p>
            <div className="benefits__subcontainer">
                <div className="benefits__icon--container">
                    <img src="/images/speed.png" className="benefits__icon--image"/>
                    <h4 className="benefits__icon--header">
                        Speed
                    </h4>
                    <p className="benefits__icon--paragraph">
                        Delivering your designs quickly and efficiently.
                    </p>
                </div>
                <div className="benefits__icon--container">
                    <img src="/images/quality.png" className="benefits__icon--image"/>
                    <h4 className="benefits__icon--header">
                        Quality
                    </h4>
                    <p className="benefits__icon--paragraph">
                        Striving to provide a top-quality experience.
                    </p>
                </div>
                <div className="benefits__icon--container">
                    <img src="/images/unique.png" className="benefits__icon--image"/>
                    <h4 className="benefits__icon--header">
                        Unique
                    </h4>
                    <p className="benefits__icon--paragraph">
                        Each design tailored to meet your needs.
                    </p>
                </div>
                <div className="benefits__icon--container">
                    <img src="/images/affordable.png" className="benefits__icon--image"/>
                    <h4 className="benefits__icon--header">
                        Affordable
                    </h4>
                    <p className="benefits__icon--paragraph">
                        Get 3D designs without breaking the bank.
                    </p>
                </div>
            </div>
            <div className="benefits__button--container">
                <a href="/" className="benefits__button--link">
                    <button className="benefits__button button__primary">Contact Us!</button>
                </a>
                <a href="/" className="benefits__button--link">
                    <button className="benefits__button button__tertiary">About Us!</button>
                </a>
            </div>
        </div>
    )
}