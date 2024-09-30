import React from "react"
import { Link, useLocation, useLoaderData, defer, Await } from "react-router-dom"
import { getCharacter } from "../../api"
import missingImg from "../../assets/images/NoImage.png"
import { AccessTokenContext } from "../../context/accessTokenContext"

export function loader({ params }) {
    return defer ({man: getCharacter(params.id)})
}

export default function ManDetail() {
    const location = useLocation()
    const dataPromise = useLoaderData()
    const [spoilerLevel, setSpoilerLevel] = React.useState(location.state?.spoilerLevel.toString() || "0")
    const search = location.state?.search || ""

    const { token, setToken } = React.useContext(AccessTokenContext)

    //toggles spoiler level changes for page
    function handleChange(event) {
        const {value} = event.target
        setSpoilerLevel(value)
    }

    function renderManElement(manData) {
        const man = manData.results[0]

        //only retrieve personality traits and show according to spoiler level
        const personalityTraits = man.traits.filter(trait => trait.group_id === "i39" && trait.spoiler <= spoilerLevel)
        const traits = personalityTraits.map(trait => trait.name)
        const titles = man.vns.map(vn => <li key={vn.id}>{vn.title}</li>)

        return (
            <div className="man-detail">
                <img src={man.image?.url || missingImg} />
                <h2>{man.name}</h2>
                <p>Personality traits: {traits.length > 0? traits.join(", ") : "None have been added to this character."}</p>
                <p>Titles they star in as a love interest:</p>
                <ul className="man-detail-titles">
                    {titles}
                </ul>
                <br/>
                <fieldset>
                    <legend>Spoiler Level for Personality Traits</legend>
                    <label>
                        <input type="radio" name="spoiler_level" value="0" checked={spoilerLevel === "0"} onChange={handleChange} />
                    No spoilers</label><br/>
                    <label>
                        <input type="radio" name="spoiler_level" value="1" checked={spoilerLevel === "1"} onChange={handleChange}/>
                    Minor spoilers</label><br/>
                    <label>
                        <input type="radio" name="spoiler_level" value="2" checked={spoilerLevel === "2"} onChange={handleChange}/>
                    Show all spoilers</label><br/>
                </fieldset>
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