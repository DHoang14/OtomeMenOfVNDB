import { createContext, useState } from "react";

const AccessTokenContext = createContext({
    token: null,
    setToken: () => {},
})

const AccessTokenProvider = ({children}) => {
    const [token, setToken] = useState(null);

    return (
        <AccessTokenContext.Provider value={{token, setToken}}>
            {children}
        </AccessTokenContext.Provider>
    )
}

export { AccessTokenContext, AccessTokenProvider }
