import React from "react"
import bgImg from "../assets/images/cloud-heart.jpg"

export default function About() {
    return (
        <div className="about-page-container">
            <img src={bgImg} className="about-main-image" />
            <div className="about-page-content">
                <h1>It can be hard to find another otome guy like your current favorite.</h1>
                <p>That's why I made this site to help people find their next otome love interest by allowing them to filter through the personality tags they've been tagged with on vndb. This site uses the vndb API to fetch results.</p>
                <p>Disclaimer that pretty much everything that can be done on this website can also be done by using vndb's search feature, but this site makes it slightly easier to view the results by showing all of their personality traits as well as their picture (if they have one) on the results page as opposed to just their name and which game they're in.</p>
            </div>
        </div>
    );
}