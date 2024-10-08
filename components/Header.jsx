import React from "react"
import { Link, NavLink } from "react-router-dom"

export default function Header() {
    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
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
            </nav>
        </header>
    )
}