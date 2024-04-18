import React from "react";
// import BannerBackground from "../Assets/home-banner-background.png";
import BannerImage from "../../Assets/home-banner-image.png";
import Navbar from "../../components/Navbar.js";
import { FiArrowRight } from "react-icons/fi";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="home-container">
      <div className="home-banner-container">
        <div className="home-text-section">
          <h1 className="primary-heading">
            Trace the journey of medical professionals through the pandemic
          </h1>

          <button className="secondary-button">
            Get Started <FiArrowRight />{" "}
          </button>
        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Landing;
