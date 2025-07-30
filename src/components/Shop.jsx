import React from "react";


const products = [
  {
    id: 1,
    name: '"American Luxury" Hoodie',
    price: 395,
    image: '/images/product1.jpg',
    soldOut: false,
  },
  {
    id: 2,
    name: '"Out Of Many, One" Hoodie',
    price: 395,
    image: '/images/product2.jpg',
    soldOut: false,
  },
  {
    id: 3,
    name: '"Out Of Many, One" L/S Tee',
    price: 225,
    image: '/images/product3.jpg',
    soldOut: true,
  },
  {
    id: 4,
    name: '"Unity Through Style" Crewneck',
    price: 325,
    image: '/images/product4.jpg',
    soldOut: false,
  },
  {
    id: 5,
    name: '"Barriers Edition" Joggers',
    price: 285,
    image: '/images/product5.jpg',
    soldOut: false,
  },
  {
    id: 6,
    name: '"Minimal Luxe" Zip Hoodie',
    price: 375,
    image: '/images/product6.jpg',
    soldOut: false,
  },
  {
    id: 7,
    name: '"Fear X Barriers" Sweatpants',
    price: 290,
    image: '/images/product7.jpg',
    soldOut: false,
  },
  {
    id: 8,
    name: '"Heritage Statement" Tee',
    price: 215,
    image: '/images/product8.jpg',
    soldOut: false,
  },
];

const Shop = () => {
  return (
    <section className="section has-background-black has-text-black">
      <div className="container">
        <div className="columns is-multiline">
          {products.map((product) => (
            <div className="column is-one-quarter" key={product.id}>
              <div className="card has-background-white has-text-black">
                <div className="card-image">
                  <figure className="image is-square">
                    <img src={product.image} alt={product.name} />
                  </figure>
                </div>
                <div className="card-content">
                  {product.soldOut && (
                    <p className="has-text-danger has-text-weight-bold is-size-7 mb-1">SOLD OUT</p>
                  )}
                  <p className="is-uppercase is-size-7 has-text-grey">Fear of God</p>
                  <p className="has-text-weight-semibold">{product.name}</p>
                  <p className="is-size-7 mt-1">${product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;