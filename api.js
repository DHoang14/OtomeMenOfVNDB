export async function getCharacters(page) {
    const bodyObj = createBasicOptionsObj()
    if (page) {
        bodyObj.page = page
    }
    
    const data = await makeRequest(bodyObj, 0)
    return data
}

export async function getCharacter(id) {
    const bodyObj = createBasicOptionsObj()

    if (id) {
        bodyObj.filters.push(["id", "=", id])
        bodyObj.fields = bodyObj.fields + ", vns.title"
    }

    const data = await makeRequest(bodyObj, 0, "individual")
    return data
}

export async function getCharactersOfType(spoilerLevel, id, page) {
    const bodyObj = createBasicOptionsObj()
    if (page) {
        bodyObj.page = page
    }
    const listOfIds = id.split(":")
    for(let tagId in listOfIds) {
        bodyObj.filters.push(["trait", "=", [`i${listOfIds[tagId]}`, spoilerLevel]])
    }
    const data = await makeRequest(bodyObj, spoilerLevel, id)
    return data
}

export async function getCount(spoilerLevel, id) {
    const bodyObj = createBasicOptionsObj()
    bodyObj.results = 0
    bodyObj.count = true
    if (id) {
        const listOfIds = id.split(":")
        for(let tagId in listOfIds) {
            bodyObj.filters.push(["trait", "=", [`i${listOfIds[tagId]}`, spoilerLevel]])
        }
    }

    const data = await makeRequest(bodyObj, spoilerLevel, id)
    return data
}

async function makeRequest(body, spoilerLevel, id) {
    let key = id === "individual"? null : `Spoiler:${spoilerLevel}Ids:${id? id : "general"}`
    if (key && body.count) { //if looking for count
        key += "Count"
    }
    else if (key && body.page) { //if searching for results to a query
        key += "Page:" + body.page
    }

    if (key) { //store results if it is not individual request about a particular character
        const storedRes = sessionStorage.getItem(key)
        if (storedRes) {
            return JSON.parse(storedRes)
        }
    }

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify(body)
    }

    const res = await fetch("https://api.vndb.org/kana/character", requestOptions)
    if (!res.ok) {
        throw {
            message: "Failed to fetch vndb data",
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()

    if (key) { //individual results are not stored (unlikely to have the user view same person multiple times)
        sessionStorage.setItem(key, JSON.stringify(data))
    }

    return data
}

function createBasicOptionsObj() {
    return {
        "filters" : ["and",
            ["sex", "=", "m"], 
            ["role", "=", "primary"], 
            ["vn", "=", 
                ["tag", "=", ["g542", 2, 0]]]
            ],
        "fields" : "name, id, image.url, traits.name, traits.group_id, traits.spoiler", 
        "sort" : "id", 
        "results" : 10, 
        "page" : 1,
        "count" : false
    }
}

export async function registerUser(user, pass, email) {
    //post
    //requires user and pass in body
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        body: JSON.stringify({email, user, pass})
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/register`, requestOptions)
    } catch (err) {
        throw {
            status: 500,
        }
    }

    if (!res.ok) {
        const errorMsg = await res.json()
        throw {
            message: errorMsg.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)
    return data
}

export async function authenticateUser(user, pass) {
    //post
    //requires user and pass in body
    //returns accesstoken
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        body: JSON.stringify({user, pass})
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/auth`, requestOptions)
    } catch (err) {
        throw {
            status: 500,
        }
    }

    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)

    return data
}

export async function refreshToken() {
    //get
    //returns accesstoken
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include"
    }
    //console.log(`${import.meta.env.REACT_APP_BACKEND_ENDPOINT}`)
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/refresh`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }

    const data = await res.json()
    console.log(data)

    return data
}

export async function logoutUser() {
    //get
    //need to delete accesstoken on front end
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include"
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/logout`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    console.log(res)
    if (res.status === 204) {
        return null;
    }
    const data = await res.json()
    console.log(data)

    return data
}

export async function createComment(charID, user, content, accessToken) {
    //post
    //requires bearer auth header (put access token in here)
    //body requires user and content
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`}, 
        credentials: "include",
        body: JSON.stringify({user, content})
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/comments/${charID}`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)

    return data
}

export async function getAllComments(charID) {
    //get
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
    }
    let res
    try {
    
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/comments/${charID}`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    console.log(res.status)
    if (res.status === 204) {
        return null;
    }
    const data = await res.json()
    console.log(data)

    return data
}

export async function forgotPassword(email) {
    //post
    //body requires email
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        body: JSON.stringify({email})
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/forgotPassword`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)

    return data
}

export async function resetVerification(resetToken) {
    //get
    //requires resetToken as params
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/reset/${resetToken}`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)

    return data
}


export async function updatePassword(user, newPassword, resetToken) {
    //put
    //body requires user, new password and reset token
    const requestOptions = {
        method: "PUT",
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        body: JSON.stringify({user, newPassword, resetToken})
    }
    let res
    try {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/updatePassword`, requestOptions)
    } catch (err) {
        throw {
            status: '500',
        }
    }
    if (!res.ok) {
        throw {
            message: res.message,
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    console.log(data)

    return data
}