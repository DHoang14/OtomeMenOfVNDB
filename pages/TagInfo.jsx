import React from "react"
import traitsJson from "../traits.json"


export default function TagInfo() {

    const personalityInfo = traitsJson.personality_traits.map(trait => {
        return (
            <p key={trait.id}>{trait.name}: {trait.description}</p>
        )
    })

    return (
        <>
            <div>
                <h1>Descriptions for Personality Tags</h1>
                {personalityInfo}
            </div>
        </>
    )
};