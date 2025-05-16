import React from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => (
  <nav className="navbar is-transparent custom-navbar" role="navigation" aria-label="main navigation">
    <div className="navbar-brand is-hidden-mobile">
      {/* Empty so we can center logo without default left push */}
    </div>

    <div className="navbar-menu is-active" style={{ width: "100%" }}>
      <div className="navbar-start">
        <Link to="/sign-in" className="navbar-item custom-link">Sign In</Link>
        <Link to="/locator" className="navbar-item custom-link">Locator</Link>
      </div>

      <div className="navbar-item navbar-center">
        <Link to="/" className="navbar-item is-flex is-align-items-center is-justify-content-center">
          <img
            src="/images/GPImages/gaspacksani.png"
            alt="GasPacks Logo"
            className="logo-image"
          />
        </Link>
      </div>

      <div className="navbar-end">
        <Link to="/Shop" className="navbar-item custom-link">Shop</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;