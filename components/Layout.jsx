import React from "react"
import { Outlet } from "react-router-dom"
import Header from "./Header"
import { AccessTokenProvider } from "../context/accessTokenContext"

export default function Layout() {
    return (
        <div className="site-wrapper">
            <Header />
            <main>
                <AccessTokenProvider>
                    <Outlet />
                </AccessTokenProvider>
            </main>
        </div>
    )
}