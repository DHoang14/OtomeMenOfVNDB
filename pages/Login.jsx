import React, { useContext, useRef } from "react"
import {
    useNavigation,
    Form,
    redirect,
    useActionData,
    useNavigate,
    json
} from "react-router-dom"
import { authenticateUser } from "../api"
import { AccessTokenContext } from "../context/accessTokenContext"
import { UserContext } from "../context/userContext"


export async function action({ request }) {
    const formData = await request.formData()
    const user = formData.get("user")
    const pass = formData.get("password")
    const pathname = new URL(request.url)
        .searchParams.get("redirectTo") || "/"

    try {
        const data = await authenticateUser(user, pass)
        return json({token: data, path: pathname, username: user})
    } catch(err) {
        return json({error: err.status})
    }
}

export default function Login() {
    const actionData = useActionData()
    const navigation = useNavigation()
    const navigate = useNavigate()
    const tokenContextRef = useRef(useContext(AccessTokenContext))
    const userContextRef = useRef(useContext(UserContext))
    React.useEffect(() => {
        if (actionData?.token) {
            console.log("login")
            localStorage.setItem("user", actionData.username)
            tokenContextRef.current.setToken(actionData.token)
            userContextRef.current.setUser(actionData.username)
            navigate(actionData.path)
        }
    }, [actionData])

    let errorMsg
    if (actionData?.error) {
        if (actionData.error === '500') {
            errorMsg = 'Cannot connect to server. Please try again in a few minutes.'
        }
    }
    
    return (
        <div className="login-container">
            <h1>Sign in to your account</h1>
            {actionData?.error && <h2 className="login-error">{errorMsg}</h2>}
            <Form 
                method="post" 
                className="login-form" 
                replace
            >
                <input
                    name="user"
                    type="text"
                    placeholder="Username"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                />
                <button
                    disabled={navigation.state === "submitting"}
                >
                    {navigation.state === "submitting"
                        ? "Logging in..."
                        : "Log in"
                    }
                </button>
            </Form>
        </div>
    )
}
