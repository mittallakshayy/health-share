import React from "react";
import { useNavigate } from "react-router-dom";
import BannerImage from "../../Assets/home-banner-image.png";
import { FiArrowRight } from "react-icons/fi";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const handleGetStartedClick = () => {
    // Redirect to home page
    navigate("/visualize");
  };
  return (
    <div className="home-container" style={{ marginBottom: "12rem" }}>
      <div className="home-banner-container">
        <div className="home-text-section">
          <h1 className="primary-heading">
            Trace the journey of medical professionals through the pandemic
          </h1>

          <button className="secondary-button" onClick={handleGetStartedClick}>
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
