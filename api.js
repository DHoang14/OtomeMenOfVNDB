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