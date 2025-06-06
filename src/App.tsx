import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { API_BASE_URL, API_OPTIONS } from '../config';
import { getTrendingMovies, updateSearchCount } from '../lib/appwrite';
import type { Movie, MovieDocument } from '../types/index';
import './App.css';
import MovieCard from './components/MovieCard';
import Search from './components/Search';
import Spinner from './components/Spinner';


function App() {
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [trendingMovies, setTrendingMovies] = useState<MovieDocument[]>([]);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearch(search), 200, [search])


  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        console.log(query, data.results[0]);
        // Update the search count in the database
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    fetchMovies(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <img src="/hero.png" alt="logo" />
          <h1>Find Movies You'll Enjoy Without the Hassle</h1>
        </header>

        <Search search={search} setSearch={setSearch} />

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie: Movie) => (
                <MovieCard key={movie.id}
                  title={movie.title}
                  vote_average={movie.vote_average}
                  poster_path={movie.poster_path}
                  release_date={movie.release_date}
                  original_language={movie.original_language}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main >
  )
}

export default App
