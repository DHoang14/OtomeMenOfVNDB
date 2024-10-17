import React from "react"
import { Link, useLocation, useLoaderData, defer, Await, useNavigate } from "react-router-dom"
import { getCharacter, getAllComments, createComment, refreshToken } from "../../api"
import missingImg from "../../assets/images/NoImage.png"
import { AccessTokenContext } from "../../context/accessTokenContext"
import MarkdownEditor from "@uiw/react-markdown-editor"
import rehypeSanitize from "rehype-sanitize"
import { logoutUser } from "../../api"
import { UserContext } from "../../context/userContext"
import Comment from './Comment'
import {ErrorBoundary} from "react-error-boundary"

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

    const [markdown, setMarkdown] = React.useState("Suggest a similar character...");

    const {user, setUser} = React.useContext(UserContext)
    const {token, setToken} = React.useContext(AccessTokenContext)
    let showAsLoggedIn = true

    const [submittingComment, setSubmittingComment] = React.useState(null)
    const [submittedComment, setSubmittedComment] = React.useState(false)
    const [submissionError, setSubmissionError] = React.useState(null)

    React.useEffect(() => {
        async function logout() {
            if (user) { //if user is logged in, log them out
                try {
                    const res = await logoutUser()
                    localStorage.removeItem("user")
                    setUser(null)
                } catch (err) {
                    //couldn't logout due to server error
                    //cannot just simulate logout due to backend (sometimes goes offline currently) being the only one who can remove the jwt cookie
                    console.log(err)
                }
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
                    <label className="radio">
                        <input type="radio" name="spoiler_level" value="0" checked={spoilerLevel === "0"} onChange={handleChange} />
                    No spoilers</label>
                    <label className="radio">
                        <input type="radio" name="spoiler_level" value="1" checked={spoilerLevel === "1"} onChange={handleChange}/>
                    Minor spoilers</label>
                    <label className="radio">
                        <input type="radio" name="spoiler_level" value="2" checked={spoilerLevel === "2"} onChange={handleChange}/>
                    Show all spoilers</label>
                </fieldset>
            </div>
        )
    }

    async function handleCommentSubmit() {
        console.log("clicked")
        if (showAsLoggedIn) {
            const charID = location.pathname.split("/")[2]; 
            try {
                setSubmittingComment(true)
                await createComment(charID, user, markdown, token.accessToken)
                setSubmissionError(null)
            } catch (err) {
                setSubmissionError(err.status)
            }
            setSubmittingComment(false)
            setSubmittedComment(true)
        } else {
            navigate(`/login?redirectTo=${location.pathname}`)
        }
    }

    function renderComments(comments) {
        console.log(comments)
        const commentElements = comments? 
                comments.map(comment => <Comment 
                key={comment.commentID}
                user={comment.userID}
                date={comment.date}
                content={comment.content}
                />)
                : null
        let createCommentElement
        if (showAsLoggedIn && !submittedComment) {
            createCommentElement = <MarkdownEditor 
                value={markdown}
                height="200px"
                onChange={(value) => setMarkdown(value)}
                previewProps={{
                    rehypePlugins: [[rehypeSanitize]],
                }}/>
        } else if (showAsLoggedIn && submittedComment) {
            if (!submissionError) {
                createCommentElement = <p>Submitted comment! Refresh the page to see your comment.</p>
            }
            else if (submissionError === 400) {
                createCommentElement = <p>Cannot submit empty comment.</p> 
            }
            else {
                createCommentElement = <p>Error submitting comment. Please try again in a few minutes.</p>
            }
        } else {
            createCommentElement = <p>You must be logged in to make a new comment.</p>
        }
        return (
            <div>
                    <div className="man-detail-comments">
                        <h2>Comments</h2>
                        {commentElements}
                    </div>
                    {createCommentElement}
                    {!submittedComment && 
                        <button
                            className="form-button"
                            onClick={handleCommentSubmit}
                            disabled={submittingComment}>
                        {showAsLoggedIn? submittingComment? "Submitting..." : "Submit comment" : "Log in"} 
                        </button>
                    }
            </div>
        )
    }


    //note: error boundary currently throws duplicate errors, but this can be resolved by updating to React 19 and implementing new options for error handling
    //TODO: update to react 19 and make sure nothing breaks
    return (
        <div className="man-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to searching for similar otome men</span></Link>
            <ErrorBoundary fallback={<h2>Failed to load character.</h2>}>
                <React.Suspense fallback={<h2>Loading character...</h2>}>
                    <Await resolve={dataPromise.man}>
                        {renderManElement}
                    </Await>
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<h2>Failed to load comments. Please try again in a few minutes.</h2>}>
                <React.Suspense fallback={<h2>Loading comments...</h2>}>
                    <Await resolve={dataPromise.comments}>
                        {renderComments}
                    </Await>
                </React.Suspense>
            </ErrorBoundary>
        </div>
    )
}