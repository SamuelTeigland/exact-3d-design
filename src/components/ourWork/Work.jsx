import './work.css'

const workSamples = [
  {
    title: "Mounts and Widgets",
    description: "Designing mounts and parts that are too difficult or expensive to source.",
    image: "/images/mounts.jpg",
  },
  {
    title: "Decorations",
    description: "Creating memorable and sentimental decorations for special events.",
    image: "/images/decoration.jpg",
  },
  {
    title: "Gifts",
    description: "Designing unique gifts for family and friends.",
    image: "/images/gifts.jpg",
  },
];
export default function Work() {
    return (
        <section className="our-work">
            <div className="container">
                <h1>Our Work</h1>
                <p className="intro">
                We specialize in custom 3D design and printing projects across industries.
                </p>
                <div className="work-grid">
                {workSamples.map((work, index) => (
                    <div key={index} className="work-card">
                    <img src={work.image} alt={work.title} />
                    <div className="card-content">
                        <h2>{work.title}</h2>
                        <p>{work.description}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    )
}