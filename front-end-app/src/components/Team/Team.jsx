import React from "react";
import "./team.css";
import Lakshay from "../../Assets/Lakshay.jpg";
import Sanjana from "../../Assets/Sanjana.jpeg";
import Parth from "../../Assets/Parth.jpeg";
import Fernando from "../../Assets/Fernando_Carvalho.jpg";

const teamMembers = [
  {
    imgUrl:
      "https://cs.sfsu.edu/sites/default/files/styles/sf_state_250x250/public/images/Shah%20Rukh%20Humayoun.jpg?h=2a479378&itok=WKw96l-K",
    name: "Shah Rukh Humayoun",
    position: "Assistant Professor",
    url: "https://cs.sfsu.edu/people/shah-rukh-humayoun",
  },

  {
    imgUrl: Fernando,
    name: "Fernando Carvalho",
    position: "Assistant Professor",
    url: "https://design.sfsu.edu/people/fernando-carvalho",
  },

  {
    imgUrl: Lakshay,
    name: "Lakshay Mittal",
    position: "Graduate Student",
    url: "mailto:contact@lakshaymittal.dev",
  },

  {
    imgUrl: Sanjana,
    name: "Sanjana G",
    position: "Graduate Student",
    url: "mailto:sgaddamanugu@sfsu.edu",
  },
  {
    imgUrl: Parth,
    name: "Parth Panchal",
    position: "Graduate Student",
    url: "mailto:ppanchal@sfsu.edu",
  },
];

const Team = () => {
  return (
    <section className="our__team">
      <div className="Teamcontainer">
        <div className="team__content">
          <h1 className="team-heading">Meet The Team</h1>
        </div>
        <div className="team__wrapper">
          {teamMembers.map((item, index) => (
            <div className="team__item" key={index}>
              <div className="team__img">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <img src={item.imgUrl} alt="" />
                </a>
              </div>
              <div className="team__details">
                <h4>{item.name}</h4>
                <p className="description">{item.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
