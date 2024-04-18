/* eslint-disable jsx-a11y/anchor-is-valid */
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav>
      <div className="nav-logo-container">
        <HealthAndSafetyIcon fontSize="large" style={{ color: "white" }} />
        HealthShare
      </div>
      <div className="navbar-links-container">
        <a href="/">Home</a>
        <a href="/visualize">Analytics</a>
        <a href="">About</a>
        <a href="">Contact</a>

        <button className="primary-button">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
