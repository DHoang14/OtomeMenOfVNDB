import React from 'react'
import { useLoaderData } from 'react-router-dom'

export async function loader ({params}) {
    return params.result
}

export default function ResetPasswordStatus() {
    const loaderData = useLoaderData()
    let resultMsg
    if (loaderData === "success") {
        resultMsg = "Password has been successfully reset!"
    } else {
        resultMsg = "Password could not be reset! Please try again."
    }
    return (
        <h1>{resultMsg}</h1>
    )
}