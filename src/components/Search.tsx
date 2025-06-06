interface SearchProps {
    search: string
    setSearch: (search: string) => void
}

const Search = (props: SearchProps) => {
    const { search, setSearch } = props

    return (
        <div className='search'>
            <div>
                <img src="/search.svg" alt="search" />
                <input type="text" placeholder='Search for a movie' value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
    )
}

export default Search