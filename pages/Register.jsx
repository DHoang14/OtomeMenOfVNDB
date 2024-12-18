import React, { useRef, useContext } from "react"
import {
    useNavigation,
    Form,
    useActionData,
    useNavigate,
    json
} from "react-router-dom"
import { authenticateUser, registerUser } from "../api"
import { AccessTokenContext } from "../context/accessTokenContext"
import { UserContext } from "../context/userContext"

export async function action({request}) {
    const formData = await request.formData()
    const email = formData.get("email")
    const user = formData.get("user")
    const pass = formData.get("password")
    const pathname = new URL(request.url)
        .searchParams.get("redirectTo") || "/"

    try {
        const newUser = await registerUser(user, pass, email)
        const data = await authenticateUser(user, pass)
        return json({token: data, path: pathname, username: user})
    } catch(err) {
        return json({error: err.status, message: err.message})
    }
}

export default function Register() {
    const actionData = useActionData()
    const navigation = useNavigation()
    const navigate = useNavigate()
    const tokenContextRef = useRef(useContext(AccessTokenContext))
    const userContextRef = useRef(useContext(UserContext))
    React.useEffect(() => {
        if (actionData?.token) {
            localStorage.setItem("user", actionData.username)
            tokenContextRef.current.setToken(actionData.token)
            userContextRef.current.setUser(actionData.username)
            navigate(actionData.path)
        }
    }, [actionData])

    let errorMsg
    if (actionData?.error) {
        if (actionData.error === 409) {
            const splitMsg = actionData.message.split(" ")
            let duplicateError
            if (splitMsg[0] == "Username" && splitMsg[1] == "Email") {
                duplicateError = "Username and Email are both "
            } 
            else {
                duplicateError = `${splitMsg[0]} is`
            }
            errorMsg = `${duplicateError} already taken. Please try again with different inputs.`
        }
        else if (actionData.error === 500) {
            errorMsg = 'Cannot connect to server. Please try again in a few minutes.'
        }
    }

    return (
        <div className="login-container">
            <h1>Register for new account</h1>
            {actionData?.error && <h2 className="login-error">{errorMsg}</h2>}
            <Form 
                method="post" 
                className="login-form" 
                replace
            >
                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                />
                <input
                    name="user"
                    type="text"
                    placeholder="Username"
                    pattern="[a-zA-Z0-9]+"
                    title="Username can only contain letters (A-Z) and numbers."
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,}"
                    title="Must contain at least one  number and one uppercase and lowercase letter, and at least 12 or more characters."
                    required
                />
                <button
                    className="form-button"
                    disabled={navigation.state === "submitting"}
                >
                    {navigation.state === "submitting"
                        ? "Registering..."
                        : "Register"
                    }
                </button>
            </Form>
        </div>
    )
}