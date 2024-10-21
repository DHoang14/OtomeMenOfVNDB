import React from 'react'
import { resetVerification, updatePassword } from '../api'
import { Form, useLoaderData, defer, Await, redirect, useNavigation } from "react-router-dom"
import {ErrorBoundary} from "react-error-boundary"

export async function loader({params}) {
    return defer ({reset: resetVerification(params.token)})
}

export async function action({params, request}) {
    const formData = await request.formData()
    const user = formData.get("username")
    const pass = formData.get("password")
    try {
        const result = await updatePassword(user, pass, params.token)
        return redirect("success")
    } catch(err) {
        redirect("fail")
    }
}

export default function ResetPassword() {
    const dataPromise = useLoaderData()
    const navigation = useNavigation()
    function renderFallback({error}) {
        let errorMessage
        if (error.status === 403) {
            errorMessage = "Reset link is invalid."
        } else {
            errorMessage = "Failed to verify reset link. Please try again in a few minutes."
        }
        return (
            <h2>{errorMessage}</h2>
        )
    }

    function renderForm(data) {
        return (
            <div className="forgot-login-container">
                <h1>Enter a new password:</h1>
                <Form 
                    method="post" 
                    className="forgot-login-form" 
                >
                        <input type="hidden" name="username" value={data.user} />
                        <input
                            name="password"
                            type="password"
                            placeholder="New password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,}"
                            title="Must contain at least one  number and one uppercase and lowercase letter, and at least 12 or more characters."
                            required
                        />
                        <button
                            className="form-button"
                            disabled={navigation.state === "submitting"}
                        >
                            Submit
                        </button>
                </Form>
            </div>
        )
    }

    return (
        <ErrorBoundary fallbackRender={renderFallback}>
            <React.Suspense fallback={<h2>Verifying reset link...</h2>}>
                <Await resolve={dataPromise.reset}>
                    {renderForm}
                </Await>
            </React.Suspense>
        </ErrorBoundary>
    )
}