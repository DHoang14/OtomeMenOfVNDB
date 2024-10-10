import React, { createContext, useState } from "react"

const UserContext = createContext({
    user: null,
    setUser: () => {},
})

const UserContextProvider = ({children}) => {
    const [user, setUser] = useState(localStorage.getItem("user"))

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export { UserContext, UserContextProvider }
