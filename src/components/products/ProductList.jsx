import { useState, useEffect } from 'react';
import sanityClient from '../.././utils/sanityClient';
import { Link } from 'react-router-dom';
import './productList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const query = `*[_type == "product"]{
      _id,
      name,
      slug,
      "thumbnail": gallery[0].asset->url,
      priceDisplay
    }`;
    const data = await sanityClient.fetch(query);
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="product-list-page">
      <h1>Products</h1>
      <div className="product-list">
        {products.map((product) => (
          <Link to={`/product/${product.slug.current}`} key={product._id} className="product-card">
            <img src={product.thumbnail} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.priceDisplay}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
