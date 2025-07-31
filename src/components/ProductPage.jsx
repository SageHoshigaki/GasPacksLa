import React from 'react';

const ProductPage = ({ product }) => {
  if (!product) return <div>Loading...</div>;

  const {
    strain_name,
    type,
    thc,
    quantity,
    price,
    image_url,
    description = "Premium strain curated by GasPacks. Hand-trimmed, slow-cured, and lab-tested for purity and potency.",
  } = product;

  return (
    <section className="section product-container fade-in">
      <div className="columns is-variable is-8 is-vcentered">

        {/* Left: Image */}
        <div className="column is-half">
          <figure className="image is-3by4">
            <img
              className="product-image"
              src={image_url}
              alt={strain_name}
              style={{ objectFit: 'cover', width: '100%' }}
            />
          </figure>
        </div>

        {/* Right: Product Details */}
        <div className="column is-half">
          <h1 className="title is-2">{strain_name}</h1>
          <h2 className="subtitle is-4 has-text-grey">
            {type} · {thc} THC · {quantity}
          </h2>
          <p className="is-size-5 mb-5">{description}</p>
          <p className="title is-4">${price}</p>

          <div className="buttons mt-4">
            <button className="button is-black is-medium">Add to Cart</button>
          </div>

          <div className="mt-6">
            <a className="is-size-7 has-text-grey mr-2" href="#">Shipping Policy</a> ·
            <a className="is-size-7 has-text-grey ml-2" href="#">Return Info</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;