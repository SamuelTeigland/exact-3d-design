import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import sanityClient from '../.././utils/sanityClient'
import { PortableText } from '@portabletext/react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './productDetail.css'

const ProductDetail = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "product" && slug.current == $slug][0]{
          name,
          description,
          stripePaymentLink,
          priceDisplay,
          "gallery": gallery[]{"url": asset->url}
        }`,
        { slug }
      )
      .then(data => setProduct(data))
      .catch(console.error)
  }, [slug])

  if (!product) return <div className="loading">Loading...</div>

 const sliderSettings = {
    infinite: product.gallery.length > 1,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    adaptiveHeight: true,
    pauseOnHover: true,
    lazyLoad: 'ondemand',
    centerMode: true,
    centerPadding: '60px',
    responsive: [
        {
        breakpoint: 768,
        settings: {
            arrows: false,
            centerMode: false,
            slidesToShow: 1,
        },
        },
        {
        breakpoint: 480,
        settings: {
            arrows: false,
            centerMode: false,
            slidesToShow: 1,
        },
        },
    ],
  }

  return (
    <div className="product-detail-container">
      <h1 className="product-title">{product.name}</h1>
      <Slider {...sliderSettings}>
        {product.gallery.map((img, i) => (
          <div key={i}>
            <img
              src={img.url}
              alt={`${product.name} image ${i + 1}`}
              className="carousel-image"
            />
          </div>
        ))}
      </Slider>
      <div className="product-description">
        <PortableText value={product.description} />
      </div>
      <div className="product-price-display">{product.priceDisplay}</div>
      <a
        href={product.stripePaymentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="buy-button"
      >
        Buy Now
      </a>
    </div>
  )
}

export default ProductDetail