import React from 'react'
import './team.css'
import Lakshay from '../../Assets/Lakshay.jpg';
import Sanjana from '../../Assets/Sanjana.jpeg';
import Parth from '../../Assets/Parth.jpeg'


const teamMembers = [
    {
        imgUrl: "https://cs.sfsu.edu/sites/default/files/styles/sf_state_250x250/public/images/Shah%20Rukh%20Humayoun.jpg?h=2a479378&itok=WKw96l-K",
        name: 'Shah Rukh Humayoun',
        position: 'Assistant Professor'
    },

    {
        imgUrl: "https://faculty.sfsu.edu/sites/default/files/styles/sfsu-100x100/public/people/profile_photo/Fernando_Carvalho-web.jpg?itok=jM9R5wjZ",
        name: 'Fernando Carvalho',
        position: 'Assistant Professor'
    },

    {
        imgUrl:Lakshay,
        name: 'Lakshay Mittal',
        position: 'Graduate Student'
    },

    {
        imgUrl: Sanjana,
        name: 'Sanjana G',
        position: 'Graduate Student'
    },
    {
        imgUrl: Parth,
        name: 'Parth Panchal',
        position: 'Graduate Student'
    },
]

const Team = () => {
    return (
        <section className='our__team'>
            <div className='Teamcontainer'>
                <div className='team__content'>
              
                    <h2>
                      Our Team
                    </h2>
                </div>
                <div className='team__wrapper'>
                    {
                        teamMembers.map((item, index) => (
                            <div className='team__item' key={index}>
                                <div className='team__img'>
                                    <img src={item.imgUrl} alt='' />
                                </div>
                                <div className='team__details'>
                                    <h4>{item.name}</h4>
                                    <p className='description'>{item.position}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Team