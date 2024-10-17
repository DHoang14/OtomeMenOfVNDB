import React from "react"
import { Link, NavLink } from "react-router-dom"
import { logoutUser } from "../api"
import { UserContext } from "../context/userContext"
import { AccessTokenContext } from "../context/accessTokenContext"

export default function Header() {
    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    const {user, setUser} = React.useContext(UserContext)
    const {token, setToken} = React.useContext(AccessTokenContext)

    let loginStatus
    if (!user) {
        loginStatus = <NavLink
            to="login"
            style={({isActive}) => isActive ? activeStyles : null}
            >
                Login/Signup
            </NavLink>
    } else if (user === "loggingOut"){
        loginStatus = <a>Logging Out...</a>

    } else {
        loginStatus = <Link 
            to="/"
            onClick={async () => {
                try {
                    setUser("loggingOut")
                    const res = await logoutUser()
                    localStorage.removeItem("user")
                    setToken(null)
                    setUser(null)
                } catch (err) {
                    //failed to log out due to server error
                    //reset status back to being logged in
                    setUser(localStorage.getItem("user"))
                }
            }}
            >
                Log out
            </Link>
    }
    return (
        <header>
            <Link className="site-logo" to="/">Otome Men of VNDB</Link>
            <nav>
                <NavLink 
                    to="about"
                    style={({isActive}) => isActive ? activeStyles : null}
                >
                    About
                </NavLink>
                <NavLink
                    to="tags"
                    style={({isActive}) => isActive ? activeStyles : null}
                >
                    Tag Information
                </NavLink>
                <NavLink 
                    to="men"
                    style={({isActive}) => isActive ? activeStyles : null}
                >
                    Otome Men
                </NavLink>
                {loginStatus}
            </nav>
        </header>
    )
}