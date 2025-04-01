// Import React and Bulma CSS
import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './fonts.css'; // Cherry Bomb One font + jump animation

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        className="has-text-centered"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: 'Cherry Bomb One, cursive',
        }}
      >
        <h1 className="title load-icon is-2 jump">GasPacks...</h1>
      </div>
    );
  }

  if (ageConfirmed === null) {
    return (
      <div
        className="has-text-centered"
        style={{
          height: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Cherry Bomb One, cursive',
        }}
      >
        <h1 className="title consent-logo is-1">GasPacks</h1>
        <p className="subtitle consent-message is-4">ARE YOU OVER 21 YEARS OF AGE?</p>
        <div className="buttons">
          <button className="button is-link is-medium" onClick={() => setAgeConfirmed(false)}>NO</button>
          <button className="button is-link is-medium" onClick={() => setAgeConfirmed(true)}>YES</button>
        </div>
      </div>
    );
  }

  if (!ageConfirmed) {
    return (
      <div
        className="has-text-centered"
        style={{
          height: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Cherry Bomb One, cursive',
        }}
      >
        <h1 className="title is-3">You must be 21 or older to enter.</h1>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff' }}>
      {/* Navbar */}
      <nav className="navbar is-black" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a
            className="navbar-item"
            href="#"
            style={{ fontFamily: 'Cherry Bomb One, cursive', fontSize: '2.75rem', color: '#fff' }}
          >
            GasPacks
          </a>
        </div>

        <div className="navbar-menu">
          <div className="navbar-end">
            <a className="navbar-item has-text-white">Shop</a>
            <a className="navbar-item has-text-white">Locator</a>
            <a className="navbar-item has-text-white">Catalog</a>
            <a className="navbar-item has-text-white">Order Online</a>
          </div>
        </div>
      </nav>

      {/* Hero Video Section */}
      <section className="section">
        <div className="container is-fluid" style={{ padding: 0 }}>
          <div className="has-text-centered">
            <video
              src="/videos/gas-landing.mp4"
              autoPlay
              muted
              loop
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Feature Section - Coming Soon */}
      <section className="section is-large">
        <div className="container">
          <div className="columns is-vcentered">
            <div className="column is-full has-text-centered">
              <h2 className="title is-3 main-headers has-text-white">Coming Soon</h2>
              <p className="subtitle is-5 has-text-white">
                Get ready to tap into the full GasPacks experience:locate exclusive distributors near you, unlock access to private events, and be first in line for major collab drops.
              </p>
              <p className="subtitle is-5 has-text-white">
                It’s more than a product — it’s a lifestyle. A culture. A movement.
              </p>
              <button className="button is-link is-medium">Notify Me</button>
            </div>
         
          </div>
        </div>
      </section>

      {/* Artist Collab Preview Section */}
      <section className="section is-large">
        <div className="container">
          <div className="columns is-vcentered">
            <div className="column is-half">
              <h2 className="title main-headers is-2 has-text-white">Certified Collab Incoming</h2>
              <p className="subtitle is-5 has-text-white">
                We're cooking up something heavy with a **major underground artist**. Vibes, visuals, and GAS. Stay locked — the drop is coming.
              </p>
            </div>
            <div className="column is-half">
              <img
                src="/images/quanny.png"
                alt="Artist Tease"
                style={{ width: '100%', borderRadius: '12px', filter: 'grayscale(100%) blur(3px)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="section">
        <div className="container">
          <div className="columns is-vcentered">
            <div className="column is-half">
              <h2 className="title main-headers is-2 has-text-white">Coming Soon</h2>
              <p className="subtitle is-5 has-text-white">
                A new wave of cannabis culture. Loud, luxury, and legendary. Stay tuned for the official Gas Packs drop.
              </p>
            </div>
            <div className="column is-half">
              <video
                src="/videos/girlsmoke.mp4"
                autoPlay
                muted
                loop
                style={{ width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="section is-medium">
        <div className="container has-text-centered">
          <h2 className="title main-headers is-3 has-text-white">Gas Packs Lifestyle</h2>
          <p className="subtitle is-5 has-text-white">
            More than just flower — it's a whole vibe. Music. Fashion. Energy. Culture.
          </p>
          <img
            src="/images/quanny.png"
            alt="Gas Packs Lifestyle"
            style={{ maxWidth: '100%', borderRadius: '12px', marginTop: '1rem' }}
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;