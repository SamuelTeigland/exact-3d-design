import './process.css'

export default function Process() {
    return (
        <div className='process__container'>
            <div className='process__header--subcontainer'>
                <h2 className="process__header">Precision-crafted printing, <span>reimagined</span>.</h2>
            </div>
            <div className='process__body--subcontainer'>
                <div className='process__subcontainer' id='process__request'>
                    <img src="/images/request.png" alt="Make a request for your 3D design!" className="process__image" />
                    <h3 className='process__subheader'>
                        Request
                    </h3>
                    <p className='process__paragraph'>
                        Reach out and describe what you'd like!
                    </p>
                </div>
                <div className='process__subcontainer' id='process__pay'>
                    <img src="/images/pay.png" alt="Pay for your design!" className="process__image" />
                    <h3 className='process__subheader'>
                        Pay
                    </h3>
                    <p className='process__paragraph'>
                        Pay for the designs.
                    </p>
                </div>
                <div className='process__subcontainer' id='process__receive'>
                    <img src="/images/receive.png" alt="Receive your 3D designs!" className="process__image" />
                    <h3 className='process__subheader'>
                        Receive
                    </h3>
                    <p className='process__paragraph'>
                        Receive your 3D designs in a timely manner.
                    </p>
                </div>
            </div>
        </div>
    )
}