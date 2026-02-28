// src/pages/Workshop.jsx
import "./workshop.css";

const lifecycle = [
  "Imagination and experimentation",
  "Practical invention",
  "Scalable manufacturing",
  "Systems engineering and integration",
];

const printers = [
  {
    name: "Harvey",
    model: "Bambu Lab X1 Carbon",
    title: "The Foundation",
    role: "Prototyping and development work",
    symbolism: "Every innovation starts somewhere.",
    copy:
      "Harvey was the first machine in the studio and remains one of its most trusted systems. With thousands of operating hours, it represents the beginning of Exact 3D Design.",
  },
  {
    name: "Da Vinci",
    model: "Bambu Lab H2D",
    title: "The Inventor",
    role: "Complex builds and multidisciplinary projects",
    symbolism: "Where imagination meets engineering.",
    copy:
      "Named after Leonardo da Vinci, this system bridges creative design and mechanical functionality.",
  },
  {
    name: "Edison",
    model: "Bambu Lab H2S",
    title: "The Industrializer",
    role: "Batch manufacturing and repeatable components",
    symbolism: "Innovation becomes production.",
    copy:
      "Inspired by Thomas Edison, this machine represents dependable output and consistent production capability.",
  },
  {
    name: "Tesla",
    model: "Bambu Lab H2S",
    title: "The Visionary",
    role: "Engineering materials and experimental applications",
    symbolism: "Engineering for what comes next.",
    copy:
      "Named for Nikola Tesla, this system focuses on advanced materials and forward-looking fabrication methods.",
  },
  {
    name: "Feynman",
    model: "Bambu Lab H2C",
    title: "The Systems Thinker",
    role: "Multi-material and precision assemblies",
    symbolism: "Complexity made elegant.",
    copy:
      "Inspired by Richard Feynman, this printer supports coordinated multi-material manufacturing workflows.",
  },
  {
    name: "Brunel",
    model: "Bambu Lab H2C",
    title: "The Master Builder",
    role: "Large-format and structural components",
    symbolism: "Engineering at full scale.",
    copy:
      "Named for Isambard Kingdom Brunel, this system is built for ambitious projects with structural reliability requirements.",
  },
  {
    name: "Whitney",
    model: "Bambu Lab H2S",
    title: "The Manufacturer",
    role: "High-volume consistent manufacturing",
    symbolism: "Precision through repetition.",
    copy:
      "Inspired by Eli Whitney, this printer represents scalable precision output across repeat production runs.",
  },
];

export default function Workshop() {
  return (
    <main className="workshop-page">
      <section className="hero">
        <p className="kicker">Our Team</p>
        <h1>Engineering, Not Hobby Printing</h1>
        <p>
          At Exact 3D Design, every printer is named after an inventor who helped shape modern engineering.
          Together, these machines form a coordinated fabrication environment where each system serves a
          defined production role, from prototyping to precision manufacturing.
        </p>
        <p>
          Built entirely on Bambu Lab technology, our workshop is focused on one thing: reliable engineered
          output, not constant machine maintenance.
        </p>
      </section>

      <section className="section">
        <h2>The Workshop Behind Exact 3D Design</h2>
        <p>
          Our equipment is more than machinery. Each name reflects the role a system plays in production and
          the mindset behind our process: experimentation, refinement, repeatability, and reliable delivery.
        </p>
      </section>

      <section className="section">
        <h2>Engineering, Not Hobby Printing</h2>
        <p>Each printer maps to a stage in the innovation lifecycle:</p>
        <ul className="lifecycle">
          {lifecycle.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Why Every Machine Is Bambu Lab</h2>
        <p>
          We chose a unified Bambu Lab platform to prioritize consistency, fast setup, automatic calibration,
          and predictable output. Standardizing on one ecosystem keeps results repeatable across the shop and
          keeps engineering work at the center.
        </p>
      </section>

      <section className="section">
        <h2>The Printer Lineage</h2>
        <div className="printer-grid">
          {printers.map((p) => (
            <article className="printer-card" key={p.name}>
              <p className="printer-name">{p.name}</p>
              <h3>
                {p.title}
                <span>{p.model}</span>
              </h3>
              <p>{p.copy}</p>
              <p>
                <strong>Role:</strong> {p.role}
              </p>
              <p>
                <strong>Symbolism:</strong> {p.symbolism}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section outro">
        <h2>More Than Machines</h2>
        <p>
          This is a coordinated production environment, not a random tool collection. Every part produced here
          carries forward a tradition of invention and turns ideas into engineered reality.
        </p>
      </section>
    </main>
  );
}
