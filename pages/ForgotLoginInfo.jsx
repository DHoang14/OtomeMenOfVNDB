import React from 'react'
import {Form, useActionData, json, useNavigation} from 'react-router-dom'
import { forgotPassword } from '../api'

export async function action ({ request }) {
    const formData = await request.formData()
    const email = formData.get("email")
    try {
        await forgotPassword(email)
        return json({success: true})
    } catch (err) {
        return json({success: false, error: err.status})
    }
    
}

export default function ForgotLoginInfo() {
    const submitted = useActionData()
    let renderElement
    if (!submitted) {
        const navigation = useNavigation()

        renderElement = <>
            <p>Forgot your password and can't login? Enter your email address to reset your password.</p>
            <Form 
                method="post" 
                className="forgot-login-form" 
            >
                    <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        required
                    />
                    <button
                        className="form-button"
                        disabled={navigation.state === "submitting"}
                    >
                        Submit
                    </button>
            </Form>
        </>
    } else if (submitted.success) {
        renderElement = <>
            <p>Instructions to reset your password have been sent and should be received in a few minutes.</p>
        </>
    } else if (submitted.error === 401){
        renderElement = <>
            <p>No account is associated with that email.</p>
        </>
    } else {
        <p>Failed to send email due to internal server errors. Please try again in a few minutes.</p>
    }
    
    return (
        <div className="forgot-login-container">
           {renderElement}
        </div>
    )
}