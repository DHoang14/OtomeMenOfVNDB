import React from "react"
import { Link, useLocation, useLoaderData, defer, Await, useNavigate, useParams } from "react-router-dom"
import { getCharacter, getAllComments, createComment, refreshToken } from "../../api"
import missingImg from "../../assets/images/NoImage.png"
import { AccessTokenContext } from "../../context/accessTokenContext"
import MarkdownEditor from "@uiw/react-markdown-editor"
import { logoutUser } from "../../api"
import { UserContext } from "../../context/userContext"

export function loader({params}) {
    return defer ({man: getCharacter(params.id), comments: getAllComments(params.id)})
}

export default function ManDetail() {
    const location = useLocation()
    const dataPromise = useLoaderData()
    console.log(dataPromise)
    const [spoilerLevel, setSpoilerLevel] = React.useState(location.state?.spoilerLevel.toString() || "0")
    const search = location.state?.search || ""
    const navigate = useNavigate()

    const [markdown, setMarkdown] = React.useState("");

    const {user, setUser} = React.useContext(UserContext)
    const {token, setToken} = React.useContext(AccessTokenContext)
    let showAsLoggedIn = true

    const [submittedComment, setSubmittedComment] = React.useState(false)

    React.useEffect(() => {
        async function logout() {
            if (user) { //if user is logged in, log them out
                const res = await logoutUser()
                localStorage.removeItem("user")
                setUser(null)
            }
        }

        async function refresh() {
            try {
                const data = await refreshToken()
                console.log(data.accessToken)
                setToken(data)
                return data
            } catch (err) {
                console.log(err)
                //if failed to get new access token, logout
                logout()
                showAsLoggedIn = false
                return null
            }
        }

        if (!token) {
            console.log("refreshed")
            refresh()
        }
    }, [])

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

    async function handleCommentSubmit() {
        console.log("clicked")
        if (showAsLoggedIn) {
            const charID = location.pathname.split("/")[2];
            await createComment(charID, user, markdown, token.accessToken)
            setSubmittedComment(true)
        } else {
            navigate(`/login?redirectTo=${location.pathname}`)
        }
    }

    function renderComments(comments) {
        console.log(comments)
        let commentElement
        if (showAsLoggedIn && !submittedComment) {
            commentElement = <MarkdownEditor 
                value={markdown}
                height="200px"
                onChange={(value) => setMarkdown(value)}/>
        } else if (showAsLoggedIn && submittedComment) {
            commentElement = <p>Submitted comment!</p>
        } else {
            commentElement = <p>You must be logged in to make a new comment.</p>
        }
        return (
            <div>
                    {commentElement}
                    {!submittedComment && 
                        <button
                            onClick={handleCommentSubmit}>
                        {showAsLoggedIn? "Submit comment" : "Log in"} 
                        </button>
                    }
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
            
            <React.Suspense fallback={<h2>Loading comments...</h2>}>
                <Await resolve={dataPromise.comments}>
                    {renderComments}
                </Await>
            </React.Suspense>
        </div>
    )
}