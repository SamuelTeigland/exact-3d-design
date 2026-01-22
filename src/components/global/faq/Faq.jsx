import { useState } from 'react';
import './faq.css';

const faqData = [
  {
    question: 'What type of 3D printing do you offer?',
    answer: (
      <p>
        We specialize in Fused Filament Fabrication (FFF), a reliable and cost-effective method for producing strong, functional parts. This technique builds objects layer by layer using thermoplastic filaments, allowing for excellent material versatility and geometric precision.
      </p>
    )
  },
  {
    question: 'Why do you use the term FFF instead of FDM?',
    answer: (
      <>
        <p>We use the term FFF (Fused Filament Fabrication) to describe our 3D printing process because it is the technically correct and industry-neutral term for this type of additive manufacturing.</p>
        <p>While FDM (Fused Deposition Modeling) is more widely recognized, it is a trademarked term owned by Stratasys, a large industrial 3D printing company. In contrast, FFF was introduced by the open-source community to describe the same layer-by-layer thermoplastic extrusion process without infringing on proprietary branding.</p>
        <p>Both terms refer to the exact same technology—a heated nozzle melts a plastic filament and deposits it in successive layers to build up a 3D object. However, using "FFF" allows us to maintain clarity, transparency, and independence in our services, especially in a market that includes both commercial and open-source platforms.</p>
        <p>At Exact 3D Design, we prioritize clear communication and open accessibility, which is why we use the more accurate and universally accepted term Fused Filament Fabrication (FFF).</p>
      </>
    )
  },
  {
    question: 'Which materials do you support?',
    answer: (
      <>
        <ul>
          <li><strong>PLA:</strong> Great for general-purpose prototypes. Rigid, easy to print, and biodegradable.</li>
          <li><strong>PETG:</strong> Strong, water-resistant, and less brittle than PLA.</li>
          <li><strong>ASA:</strong> UV-resistant, weatherable, and ideal for outdoor parts.</li>
          <li><strong>ABS:</strong> Durable and impact-resistant, suited for mechanical use.</li>
          <li><strong>ABS-ESD:</strong> Electrically static-dissipative ABS for use around sensitive electronics.</li>
          <li><strong>ABS-CF:</strong> Increased stiffness and thermal resistance over standard ABS.</li>
          <li><strong>PA6-CF / PA6-GF:</strong> Excellent strength, fatigue resistance, and thermal stability.</li>
          <li><strong>PA12-CF / PA12-GF:</strong> Low moisture absorption and exceptional chemical resistance.</li>
          <li><strong>PPA-CF:</strong> Extremely rigid and heat-resistant, designed for demanding applications.</li>
          <li><strong>PP-G30:</strong> Lightweight, chemically resistant, perfect for automotive or marine use.</li>
          <li><strong>TPU 95A:</strong> Durable and flexible—ideal for seals, gaskets, and enclosures.</li>
          <li><strong>TPU 82A / 80A:</strong> Softer and more elastic grades, great for wearables or grips.</li>
        </ul>
        <p>If you’re unsure which material is right for your application, we’re happy to provide guidance based on your specific performance requirements.</p>
      </>
    )
  },
  {
    question: 'What is the maximum print size you can accommodate?',
    answer: (
      <p>
        We can produce parts up to 340mm x 340mm x 340mm in a single build. Larger items can be printed in sections and joined using advanced bonding techniques for structural integrity.
      </p>
    )
  },
  {
    question: 'Can you help with 3D design or reverse engineering?',
    answer: (
      <p>
        Absolutely. Whether you have a hand-drawn sketch, a physical object to replicate, or just a concept in mind, our team can provide full CAD design services and reverse engineering using digital calipers and high-resolution scanning. Files are provided in standard formats like STL, STEP, and 3MF.
      </p>
    )
  },
  {
    question: 'How do I request a quote for my part?',
    answer: (
      <>
        <p>Click the “Get Quote” button located on any page of our website to launch our online quoting app. This tool allows you to:</p>
        <ul>
          <li>Upload one or multiple 3D models (.STL, .STEP, .3MF supported)</li>
          <li>Select preferred materials and layer resolution</li>
          <li>Choose quantity and any post-processing requirements</li>
          <li>Get instant pricing or submit for manual review (for complex jobs)</li>
          <li>Track your quote history and download invoice PDFs</li>
        </ul>
        <p>You’ll receive a quote within minutes for most jobs. For more intricate requests, a team member will follow up with a customized review.</p>
      </>
    )
  },
  {
    question: 'Do you offer post-processing services?',
    answer: (
      <>
        <p>Yes. We provide several post-processing options depending on your needs:</p>
        <ul>
          <li>Support removal and sanding</li>
          <li>Surface smoothing (vapor, chemical, or mechanical depending on material)</li>
          <li>Priming and painting</li>
          <li>Threaded inserts or hardware installation</li>
          <li>Assembly and packaging for end-use delivery</li>
        </ul>
      </>
    )
  },
  {
    question: 'Do you ship orders?',
    answer: (
      <p>
        We ship nationwide with options for expedited service. All parts are carefully packaged to prevent damage in transit. Local pickup is also available by appointment.
      </p>
    )
  },
  {
    question: 'Is my intellectual property safe with Exact 3D Design?',
    answer: (
      <p>
        Yes. All uploaded files are treated as confidential and protected by our internal data handling protocols. We are happy to sign NDAs upon request and embed copyright protection into CAD metadata when applicable.
      </p>
    )
  },
  {
    question: 'How long will it take to get my parts?',
    answer: (
      <>
        <p>Lead times vary based on material, quantity, and post-processing:</p>
        <ul>
          <li><strong>Standard parts:</strong> 2–3 business days</li>
          <li><strong>Engineering-grade materials or large volumes:</strong> 4–7 business days</li>
          <li><strong>Custom or post-processed jobs:</strong> Varies; we'll provide a delivery estimate with your quote</li>
        </ul>
        <p>Rush options are available upon request.</p>
      </>
    )
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      {faqData.map((item, index) => (
        <div
          key={index}
          className={`faq-item ${openIndex === index ? 'open' : ''}`}
        >
          <div className="faq-question" onClick={() => toggleAnswer(index)}>
            {item.question}
          </div>
          <div className="faq-answer">
            {item.answer}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Faq;