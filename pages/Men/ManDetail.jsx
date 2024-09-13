import React from "react"
import { Link, useLocation, useLoaderData, defer, Await } from "react-router-dom"
import { getCharacter } from "../../api"

export function loader({ params }) {
    return defer ({man: getCharacter(params.id)})
}

export default function ManDetail() {
    const location = useLocation()
    const dataPromise = useLoaderData()
    
    const search = location.state?.search || "";

    function renderManElement(manData) {
        const man = manData.results[0]
        const personalityTraits = man.traits.filter(trait => trait.group_id === "i39")
        const traits = personalityTraits.map(trait => trait.name)
        const titles = man.vns.map(vn => vn.title)

        return (
            <div className="man-detail">
                <img src={man.image.url} />
                <h2>{man.name}</h2>
                <p>Personality traits: {traits.join(", ")}</p>
                <p>Titles they star in as a love interest: {titles.join(", ")}</p>
            </div>
        )
    }

    return (
        <div className="man-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to searching for similar otome men</span></Link>

            <React.Suspense fallback={<h2>Loading character...</h2>}>
                <Await resolve={dataPromise.man}>
                    {renderManElement}
                </Await>
            </React.Suspense>
        </div>
    )
}