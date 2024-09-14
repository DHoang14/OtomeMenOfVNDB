import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
    return (
        <>
            <div className="home-banner">
                <h1>Have you ever wanted to look for another otome guy who's similar to another one you liked?</h1>
                <p>Well now you can. This site allows you to look through otome men listed on vndb in a picture grid view as opposed to the list view given in vndb's search results.</p>
                <Link to="men">Find your next otome love interest now</Link>
            </div>
            <div className="home-changelog">
                <h2>Changelog: </h2>
                <ul>
                    <li>9/13: Updated theme and added spoilers filter</li>
                    <li>9/10: Implemented filtering by multiple personality tags</li>
                    <li>9/9: Implemented filtering by personality tag</li>
                </ul>
            </div>
        </>
    )
};