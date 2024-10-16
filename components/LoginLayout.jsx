import React from "react"
import { NavLink, Outlet, useSearchParams } from "react-router-dom"

export default function LoginLayout() {
    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
    }

    const [searchParams, setSearchParams] = useSearchParams()
    const redirect = searchParams.get("redirectTo")
    return (
        <>
            <nav className="login-nav">
                <NavLink
                    to="."
                    end
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Login
                </NavLink>

                <NavLink
                    to={`register${redirect? `?redirectTo=${redirect}` : ""}`}
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Register
                </NavLink>
            </nav>
            <Outlet />
        </>
    )
}