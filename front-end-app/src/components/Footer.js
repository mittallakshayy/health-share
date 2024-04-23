import React from "react";
import {
  MDBFooter,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
} from "mdb-react-ui-kit";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";

export default function Footer() {
  return (
    <MDBFooter bgColor="light" className="text-center text-lg-start text-muted">
      <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div className="me-5 d-none d-lg-block">
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <a href="" className="me-4 text-reset">
            <FacebookIcon></FacebookIcon>
          </a>

          <a href="" className="me-4 text-reset">
            <XIcon></XIcon>
          </a>
          <a href="" className="me-4 text-reset">
            <MDBIcon fab icon="instagram" />
          </a>
          <a href="" className="me-4 text-reset">
            <LinkedInIcon></LinkedInIcon>
          </a>
          <a href="" className="me-4 text-reset">
            <GitHubIcon></GitHubIcon>
          </a>
        </div>
      </section>

      <section className="">
        <MDBContainer className="text-center text-md-start mt-5">
          <MDBRow className="mt-3">
            <MDBCol md="3" lg="4" xl="3" className="mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <HealthAndSafetyIcon></HealthAndSafetyIcon>
                HealthShare
              </h6>
              <p>
                HealthShare aims to offer a comprehensive and engaging platform
                where data meets storytelling. We collect and visualize textual
                data related to healthcare workers’ experiences, challenges, and
                triumphs during the COVID-19 crisis.
              </p>
            </MDBCol>

            <MDBCol md="2" lg="2" xl="2" className="mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4"> Data Sources</h6>
              <p>
                <a href="#!" className="text-reset">
                  Twitter
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  LinkedIn
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Facebook
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Articles
                </a>
              </p>
            </MDBCol>

            <MDBCol md="3" lg="2" xl="2" className="mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Useful links</h6>
              <p>
                <a href="/" className="text-reset">
                  Home
                </a>
              </p>
              <p>
                <a href="/visualize" className="text-reset">
                  Analytics
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  About
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Contact
                </a>
              </p>
            </MDBCol>

            <MDBCol md="4" lg="3" xl="3" className="mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
              <p>
                <HomeIcon icon="home" className="me-2" />
                San Francisco, CA 94132, US
              </p>
              <p>
                <EmailIcon icon="envelope" className="me-3" />
                contact@healthshare.com
              </p>
              <p>
                <LocalPhoneIcon icon="phone" className="me-3" /> + 01 234 567 88
              </p>
              <p>
                <LocalPhoneIcon icon="print" className="me-3" /> + 01 234 567 89
              </p>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      <div
        className="text-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
      >
        © 2024 Copyright: 
        <a className="text-reset fw-bold" style={{ textDecoration: 'none' }}> HealthShare</a>
      </div>
    </MDBFooter>
  );
}
