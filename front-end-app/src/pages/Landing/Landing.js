import React from "react";
import { useNavigate } from "react-router-dom"; 
import BannerImage from "../../Assets/home-banner-image.png";
import { FiArrowRight } from "react-icons/fi";
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
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

          <button className="secondary-button"  onClick={handleGetStartedClick}>
            Get Started <FiArrowRight />{" "}
          </button>
        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>
        {/* About Section with Circular Icons */}
        <div className="about-section">
        <h2 className="section-title"></h2>
        <div className="about-cards">
          <div className="about-card">
            <div className="icon-container">
            <DevicesIcon fontSize="large" className="about-icon" />

            </div>
            <p>Welcome to HealthShare! Our innovative online platform gathers and organizes the heartfelt stories shared by healthcare professionals on social media during the COVID-19 pandemic. Using advanced machine learning and data mining, we transform scattered information from various sources into a structured and accessible database, inviting everyone to explore these valuable insights.

</p></div>
         
          <div className="about-card">
            <div className="icon-container">
              <PeopleIcon fontSize="large" className="about-icon" />
            </div>
            <p>HealthShare is designed for everyone—health professionals, researchers, policymakers, and the curious public. We provide a unique glimpse into the experiences of healthcare workers during these challenging times. By amplifying their voices, we enhance understanding and inform better decisions that lead to improved healthcare practices.

</p>
          </div>
          <div className="about-card">
            <div className="icon-container">
            <HealthAndSafetyIcon fontSize="large" className="about-icon" />

            </div>
            <p>At the core of HealthShare is our dedication to frontline workers. By showcasing their diverse experiences, we aim to drive targeted interventions and policies that strengthen health system resilience. Join us in our mission to uplift healthcare systems and communities, ensuring better health outcomes for all!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
