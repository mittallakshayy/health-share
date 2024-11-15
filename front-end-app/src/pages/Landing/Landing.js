import React, { useEffect, useRef } from "react";
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import CountUp from 'react-countup';
import BannerImage from "../../Assets/home-banner-image.png";
import { FiArrowRight } from "react-icons/fi";
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Team from "../../components/Team/Team"
import "./Landing.css";
const carouselImages = [
  require("../../Assets/img1.png"),
  require("../../Assets/img2.png"),
  require("../../Assets/img3.png"),
  require("../../Assets/img4.png"), 
  require("../../Assets/img5.png"),
  require("../../Assets/img6.png"),
  require("../../Assets/img7.png"),
  require("../../Assets/img8.png"),
];
const carouselLinks = [
  "https://www.linkedin.com/news/story/nurses-pressured-to-work-while-sick-4630137/", // Link for img1
  "https://www.linkedin.com/pulse/omicron-variant-burning-out-nurses-beth-kutscher/", // Link for img2
  "https://www.nytimes.com/2022/09/29/health/doctor-burnout-pandemic.html", // Link for img3
  "https://www.bloomberg.com/news/articles/2022-07-20/nurse-burnout-reaches-new-high-as-latest-omicron-variant-surges", // Link for img4
  "https://www.aha.org/other-resources/2020-08-27-front-line-special-forces-share-candid-stories-university-utah-health", // Link for img5
  "https://www.aha.org/issue-landing-page/2020-06-02-stories-front-lines", // Link for img6
  "https://www.medicalnewstoday.com/articles/1-year-of-covid-19-a-doctors-perspective", // Link for img7
  "https://www.phyins.com/magazine/reflections-frontline-heroes"  // Link for img8
];

const Landing = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const scrollingRef = useRef(true); 

  useEffect(() => {
    const scrollImages = () => {
      if (carouselRef.current && scrollingRef.current) {
        const totalScrollWidth = carouselRef.current.scrollWidth;
        const clientWidth = carouselRef.current.clientWidth;
        // Set to a higher value for faster scrolling
        carouselRef.current.scrollLeft += 1.8;
        // Enhance reset logic for faster speeds
        if (carouselRef.current.scrollLeft >= totalScrollWidth - clientWidth) {
          carouselRef.current.scrollLeft = 0;
        }
        requestAnimationFrame(scrollImages);
      }
    };

    scrollImages();

    const refCurrent = carouselRef.current;
    // Event listeners for mouse enter and leave
    const handleMouseEnter = () => (scrollingRef.current = false);
    const handleMouseLeave = () => {
      scrollingRef.current = true;
      requestAnimationFrame(scrollImages);
    };
    if (refCurrent) {
      refCurrent.addEventListener('mouseenter', handleMouseEnter);
      refCurrent.addEventListener('mouseleave', handleMouseLeave);
    }
    // Cleanup function
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener('mouseenter', handleMouseEnter);
        refCurrent.removeEventListener('mouseleave', handleMouseLeave);
      }
      scrollingRef.current = true;  // Stop scrolling on unmount
    };
  }, []);

  const handleGetStartedClick = () => {
    // Redirect to home page
    navigate("/visualize");
  };
  return (
    <div>
    <div className="home-container" >
      <div className="home-banner-container">
        <div className="home-text-section">
          <h1 className="primary-heading">
            Trace the journey of medical professionals through the pandemic
          </h1>
          <button className="secondary-button" onClick={handleGetStartedClick}>
            Get Started <FiArrowRight />{" "}
          </button>
          <div className="stats-flexbox">
    <div className="stats-item">
      <h3><CountUp start={0} duration={2} end={50} />K</h3>
      <p>Tweets</p>
    </div>
    <div className="stats-item">
      <h3><CountUp start={0} duration={2} end={15} />K</h3>
      <p>Articles</p>
    </div>
    <div className="stats-item">
      <h3><CountUp  start={0} duration={3} end={7} />K</h3>
      <p>Posts</p>
    </div>
  </div>
        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>

        {/* About Section with Circular Icons */}
        <div className="about-section">
        <h1>What is HealthShare?</h1>
      <h6>HealthShare offers a rich collection of stories and insights to deepen your understanding of frontline medical experiences during the COVID-19 pandemic.</h6>
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
              <PeopleIcon fontSize="large"className="about-icon" />
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
      </div></div>
        
        <div className="dataset-overview-section">
        <h1>Dataset Overview</h1>
        <h6>At HealthShare, you'll find a wealth of stories and data needed to understand the challenges faced by frontline medical professionals during the pandemic.</h6>
        <div className="dataset-stats">
          <div className="dataset-item">
            <h3>50K</h3>
            <p>Tweets</p>
          </div>
          <div className="dataset-item">
            <h3>15k</h3>
            <p>Published Articles</p>
          </div>
          <div className="dataset-item">
            <h3>6,900</h3>
            <p>Facebook</p>
          </div>
        </div>
      </div>

      <div className="glimpse-section">
  <h1 className="glimpse-heading">Glimpse into Frontline stories</h1>
  <h6>HealthShare offers a rich collection of stories and insights to deepen your understanding of frontline medical experiences during the COVID-19 pandemic.</h6>
  <div className="image-carousel" ref={carouselRef}>
    {carouselImages.map((image, index) => (
      <img 
        key={index} 
        src={image} 
        className="carousel-image" 
        alt={`image${index + 1}`} 
        onClick={() => window.open(carouselLinks[index], "_blank")} // Opens the link in a new tab
      />
    ))}
  </div>      
</div>   
<Team></Team>
    </div>
  );
};

export default Landing;
