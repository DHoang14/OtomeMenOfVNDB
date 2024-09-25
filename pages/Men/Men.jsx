import React from "react"
import {
    Link,
    useSearchParams,
    useLoaderData,
    defer,
    Await,
    Form, 
    redirect
} from "react-router-dom"
import { getCharacters, getCharactersOfType, getCount } from "../../api"
import traitsJson from "../../traits.json"
import missingImg from "../../assets/images/NoImage.png"

//on page load, retrieve character data depending on applied filters and page
export function loader({request}) {
    const searchParams = new URL(request.url).searchParams
    const type = searchParams.get("type")
    const page = searchParams.get("page")
    const spoilerLevel = searchParams.get("spoiler") || "0"

    if (type) {
        return defer({ men: getCharactersOfType(spoilerLevel, type, page), count: getCount(spoilerLevel, type) })
    }
    return defer({ men: getCharacters(page), count: getCount("0") })
}

//after personality tags and spoiler level is applied
export async function action ({request}) {
    const formData = await request.formData()
    const traitsSelected = Array.from(formData.keys())
    traitsSelected.pop() //last key will always be spoiler level, so remove from array of traits
    const spoilerLevel = formData.get("spoiler_level")
    let redirectUrl = spoilerLevel > 0? `?spoiler=${spoilerLevel}` : ""
    return redirect(traitsSelected.length > 0? 
        `${redirectUrl}${redirectUrl.length > 0? "&" : "?"}type=${traitsSelected.join(":")}` : redirectUrl)
}

export default function Men() {
    const [searchParams, setSearchParams] = useSearchParams()
    const dataPromise = useLoaderData()

    //assume no spoilers if not specified
    let spoilerLevel = searchParams.get("spoiler") || 0
    if (spoilerLevel !== 0) {
        spoilerLevel = parseInt(spoilerLevel)
    }

    //set page number in search params
    function loadMore(page) {
        setSearchParams(prevParams => {
            if (page === null) {
                prevParams.delete("page")
            } else {
                prevParams.set("page", page)
            }
            return prevParams
        })
    }

    //unchecks all personality filters
    function clearFilters() {
        const personalityFilters = document.getElementsByClassName("personalityFilter")
        for(let filter in personalityFilters) {
            if(personalityFilters[filter] instanceof Object) {
                personalityFilters[filter].checked = false
            }
        }
    }

    //creates filters section to apply on left
    function renderFilters() {
        const filterString = searchParams.get("type")
        //decides which personality tags need to be automatically checked to reflect applied filters of the page on load
        const listOfSelectedIds = filterString? filterString.split(":") : null
        
        //creates personality tags checkboxes
        const personalityFiltersChecks = traitsJson.personality_traits.map(trait => {
            return (
                <label className="checkbox" key={trait.name + "Checkbox"}>
                    <input
                        className="personalityFilter"
                        type="checkbox"
                        name={trait.id}
                        defaultChecked={listOfSelectedIds? listOfSelectedIds.includes(trait.id.toString()) : false}
                    />
                {trait.name}</label>
            )
        })

        //creates spoiler level selection
        const spoilerElement = (
            <div>
                <label>
                    <input type="radio" name="spoiler_level" value="0" defaultChecked={spoilerLevel === 0} />
                No spoilers</label><br/>
                <label>
                    <input type="radio" name="spoiler_level" value="1" defaultChecked={spoilerLevel === 1} />
                Minor spoilers</label><br/>
                <label>
                    <input type="radio" name="spoiler_level" value="2" defaultChecked={spoilerLevel === 2}/>
                Show all spoilers</label><br/>
            </div>
        )

        return (
            <div className="man-filter-container">
                <Form method="post" className="man-filter-form">
                    <fieldset>
                        <legend>Personality Traits</legend>
                        {personalityFiltersChecks}
                    </fieldset>
                    <fieldset>
                        <legend>Spoiler Level</legend>
                        {spoilerElement}
                    </fieldset>
                    <button className="man-button">Apply filters</button>
                </Form>
                <button className="man-button" onClick={() => clearFilters()}>Clear all filters</button>
            </div>
        )
    }

    //renders results on right with current page at the bottom
    function renderMenElements(data) {
        const displayedMen = data[0].results //results of the api call
    
        const menElements = displayedMen.map(man =>  {
            //only list personality traits of selected spoiler level
            const traits = man.traits.filter(trait => trait.group_id === "i39" && trait.spoiler <= spoilerLevel)
            const traitNames = traits.map(trait => trait.name)
            return (
            <div key={man.id} className="man-tile">
                <Link
                    to={man.id}
                    state={{
                        search: `?${searchParams.toString()}`,
                        spoilerLevel: spoilerLevel
                    }}
                >
                    <img src={man.image?.url || missingImg} />
                    <div className="man-info">
                        <h3>{man.name}</h3>
                        <p>Traits: {traitNames.length > 0? traitNames.join(", ") : "None have been added to this character."}</p>
                    </div>
                </Link>
            </div>
            )})

        //creates pages at the bottom
        const pages = Math.ceil(data[1].count / 10) //total pages
        const currentPage = parseInt(searchParams.get("page"), 10) || 1

        //always show option to go to first page
        const pageElements = [            
            <button 
                onClick={() => loadMore(null)}
                className={
                    `man-button 
                ${currentPage === 1 ? "selected" : ""}`}
                key="page1"
            >1</button>]


        //show "..." divider between page 1 and current page if there is significant gap
        if (currentPage - 2 > 1) {
            pageElements.push(
                <button 
                    className="man-button"
                    key="pageDividerLeft"
                >...</button>)
        }

        //show previous page if there is one (exclude if previous page is first page)
        if (currentPage - 1 > 1) {
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage - 1)}
                    className="man-button"
                    key={`page${currentPage - 1}`}
                >{currentPage - 1}</button>)
        }

        //show current page if not on first or last page
        if (currentPage !== 1 && currentPage !== pages) {
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage)}
                    className="man-button selected"
                    key={`page${currentPage}`}
                >{currentPage}</button>)
        }

        //show next page if there is one (exclude if next page is last page)
        if (currentPage + 1 < pages) {
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage + 1)}
                    className="man-button"
                    key={`page${currentPage + 1}`}
                >{currentPage + 1}</button>)
        }

        //show "..." divider between current page and last page if there is significant gap in between
        if (currentPage + 2 < pages) {
            pageElements.push(
                <button 
                    className="man-button"
                    key="pageDividerRight"
                >...</button>)
        }

        //always show last page
        if (pages > 1) {
            pageElements.push(
                <button 
                    onClick={() => loadMore(pages)}
                    className={
                        `man-button 
                    ${currentPage === pages ? "selected" : ""}`}
                    key={`page${pages}`}
                >{pages}</button>)
        }

        return (
            <div className="man-list">
                {data[1].count === 0 && <h3 className="man-list-no-results">No results found.</h3>}
                {menElements}
                <div className="man-page-list">
                    {pageElements}
                </div>
            </div>
        )
    }

    return (
        <div className="man-page-container">
            <h1>Look through a list of otome men</h1>
            <div className="man-page-content-container">
                {renderFilters()}
                <React.Suspense fallback={<h2>Loading men...</h2>}>
                    <Await resolve={Promise.all([dataPromise.men, dataPromise.count])}>
                        {renderMenElements}
                    </Await>
                </React.Suspense>
            </div>
        </div>
    )
}