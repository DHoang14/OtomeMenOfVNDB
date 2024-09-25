import React from "react"
import traitsJson from "../traits.json"
import parse from "html-react-parser"

export default function TagInfo() {
    const personalityInfo = traitsJson.personality_traits.map(trait => {
        return (
            <p className="tag-item" key={trait.id}>{trait.name}: {parse(trait.description)}</p>
        )
    })

    return (
        <>
            <div className="tag-content">
                <h1 className="tag-header">Descriptions for Personality Tags</h1>
                {personalityInfo}
            </div>
        </>
    )
};