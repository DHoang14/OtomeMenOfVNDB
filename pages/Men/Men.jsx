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

export function loader({request}) {
    const searchParams = new URL(request.url).searchParams
    const type = searchParams.get("type")
    const page = searchParams.get("page")

    if (type) {
        return defer({ men: getCharactersOfType(type, page), count: getCount(type) })
    }
    return defer({ men: getCharacters(page), count: getCount() })
}

export async function action ({request}) {
    const formData = await request.formData()
    const traitsSelected = Array.from(formData.keys())
    return redirect(traitsSelected.length > 0? `?type=${traitsSelected.join(":")}` : "")

}

export default function Men() {
    const [searchParams, setSearchParams] = useSearchParams()
    const dataPromise = useLoaderData()

    const typeFilter = searchParams.get("type")
    function handleFilterChange(key, value) {
        setSearchParams(prevParams => {
            prevParams.delete("page")

            if (value === null) {
                prevParams.delete(key)
            } else {
                prevParams.set(key, value)
            }
            return prevParams
        })
    }
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

    function clearFilters() {
        const personalityFilters = document.getElementsByClassName("personalityFilter")
        for(let filter in personalityFilters) {
            if(personalityFilters[filter] instanceof Object) {
                personalityFilters[filter].checked = false
            }
        }
    }

    function renderMenElements(data) {
        const displayedMen = data[0].results //results of the api call
        const menElements = displayedMen.map(man =>  {
            const traits = man.traits.filter(trait => trait.group_id === "i39") //only list personality traits
            const traitNames = traits.map(trait => trait.name)
            return (
            <div key={man.id} className="man-tile">
                <Link
                    to={man.id}
                    state={{
                        search: `?${searchParams.toString()}`,
                    }}
                >
                    <img src={man.image?.url || "data:,"} />
                    <div className="man-info">
                        <h3>{man.name}</h3>
                        <p>Traits: {traitNames.join(", ")}</p>
                    </div>
                </Link>
            </div>
            )})

        const filterString = searchParams.get("type")
        const listOfSelectedIds = filterString? filterString.split(":") : null
        const personalityFiltersChecks = traitsJson.personality_traits.map(trait => {
            return (
                <div key={trait.name + "Checkbox"}>
                    <input
                        className="personalityFilter"
                        type="checkbox"
                        name={trait.id}
                        id={trait.id}
                        defaultChecked={listOfSelectedIds? listOfSelectedIds.includes(trait.id.toString()) : false}
                    />
                    <label htmlFor={trait.id}>{trait.name}</label>
                </div>
            )
        })

        const pages = Math.ceil(data[1].count / 10)
        const currentPage = parseInt(searchParams.get("page"), 10) || 1
        const pageElements = [            
            <button 
                onClick={() => loadMore(null)}
                className={
                    `man-type simple 
                ${currentPage === 1 ? "selected" : ""}`}
                key="page1"
            >1</button>]


        if (currentPage - 2 > 1) {
            pageElements.push(
                <button 
                    className="man-type simple"
                    key="pageDividerLeft"
                >...</button>)
        }

        //show prev page
        if (currentPage - 1 > 1) { //if first is not prev page or current page
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage - 1)}
                    className="man-type simple"
                    key={`page${currentPage - 1}`}
                >{currentPage - 1}</button>)
        }

        if (currentPage !== 1 && currentPage !== pages) { //if not on first or last page, show current page
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage)}
                    className="man-type simple selected"
                    key={`page${currentPage}`}
                >{currentPage}</button>)
        }

        //show next page
        if (currentPage + 1 < pages) { //if next or current is not last page 
            pageElements.push(
                <button 
                    onClick={() => loadMore(currentPage + 1)}
                    className="man-type simple"
                    key={`page${currentPage + 1}`}
                >{currentPage + 1}</button>)
        }

        if (currentPage + 2 < pages) {
            pageElements.push(
                <button 
                    className="man-type simple"
                    key="pageDividerRight"
                >...</button>)
        }

        if (pages > 1) {
            pageElements.push(
                <button 
                    onClick={() => loadMore(pages)}
                    className={
                        `man-type simple 
                    ${currentPage === pages ? "selected" : ""}`}
                    key={`page${pages}`}
                >{pages}</button>)
        }


        return (
            <>
                <div className="man-list-content-container">
                    <div className="man-list-filter-buttons">
                        <h2>Personality Traits</h2>
                        <Form method="post" className="man-list-filter-form">
                            {personalityFiltersChecks}
                            <button className="man-type simple">Apply filters</button>
                        </Form>
                        <button className="man-type simple" onClick={() => clearFilters()}>Clear all filters</button>

                    </div>
                    <div className="man-list">
                        {data[1].count === 0 && <h3 className="man-list-no-results">No results found.</h3>}
                        {menElements}
                        <div className="page-list">
                            {pageElements}
                        </div>
                    </div>
                </div>
                
            </>
        )
    }

    return (
        <div className="man-list-container">
            <h1>Look through a list of otome men</h1>
            <React.Suspense fallback={<h2>Loading men...</h2>}>
                <Await resolve={Promise.all([dataPromise.men, dataPromise.count])}>
                    {renderMenElements}
                </Await>
            </React.Suspense>
        </div>
    )
}