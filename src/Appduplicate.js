import { useEffect, useState } from "react";
import StarRating from "./Starrating";

const key = "db7f839d";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isloading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedid, setSelectedid] = useState();

  function handleclick(id) {
    setSelectedid((selectedid) => (selectedid === id ? null : id));
  }

  function handleclose() {
    // setSelectedid(null);
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setisLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${key}&s=${query}`
          );

          // When network was gone this error was reflected
          if (!res.ok)
            throw new Error(" Somting went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "false") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          setError(err.message);
        } finally {
          setisLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        setisLoading("");
        return;
      }

      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Found movies={movies} />
        <Search query={query} setQuery={setQuery} />
      </Navbar>
      <Main>
        <Box>
          {/* {isloading ? <Loader /> : <Movieslist movies={movies} />} */}
          {isloading && <Loader />}
          {!isloading && !error && (
            <Movieslist movies={movies} onSelectMovie={handleclick} />
          )}
          {error && <Errormessage message={error} />}
        </Box>

        <Box>
          {selectedid ? (
            <Moviedetail selectedid={selectedid} Onclosemovie={handleclose} />
          ) : (
            <>
              <Watchedsummary watched={watched} />
              <Watchmovielist watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// Navbar ///////////////////////////////////////////////////

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />

      {children}
    </nav>
  );
}

///// Logo ///////////////////////////////////////////////////////

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>

      <h1>usePopcorn</h1>
    </div>
  );
}

//// Search /////////////////////////////////////////////////////////////

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

///// Found /////////////////////////////////////////////////////////////////

function Found({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

// List_Box ///////////////////////////////////////////////////////////////////////

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// List_box -- Movies //////////////////////////////////////////////////////////////

/// Showing message for loading for fatch the data
function Loader() {
  return <p className="loader">Loading...</p>;
}

/// showing error message for when user was in offline
function Errormessage({ message }) {
  <p className="error">
    <span>{message}</span>
  </p>;
}

function Movieslist({ movies, onSelectMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

// List_box -- movielist -- movie ///////////////////////////////////////////////////////

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />

      <h3>{movie.Title}</h3>

      <div>
        <p>
          <span>🗓</span>

          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// Watch_Box //////////////////////////////////////////////////////////////////////////////

function Moviedetail({ selectedid, Onclosemovie }) {
  const [movie, setMovie] = useState({});
  const [isloading, setisLoading] = useState(false);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Release: release,
    Actor: actor,
    Director: director,
    Genre: genre,
  } = movie;

  console.log(title, year);

  useEffect(
    function () {
      async function getmovieslist() {
        setisLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${key}&i=${selectedid}`
        );
        const data = await res.json();
        setMovie(data);
        setisLoading(false);
      }
      getmovieslist();
    },
    [selectedid]
  );

  return (
    <div className="details">
      {isloading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={Onclosemovie}>
              -
            </button>
            <img src={poster} alt={`poster of movie ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {release} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span></span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating maxrate={10} size={"2rem"} />
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actor}</p>
            <p>Director by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchBox() {
  const [watched, setWatched] = useState([]);

  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <Watchedsummary watched={watched} />

          <Watchmovielist watched={watched} />
        </>
      )}
    </div>
  );
}

//// watch_box -- Watchedsummary  /////////////////////////////////////////////////////////////////////////////

function Watchedsummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));

  const avgUserRating = average(watched.map((movie) => movie.userRating));

  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>

      <div>
        <p>
          <span>#️⃣</span>

          <span>{watched?.length} movies </span>
        </p>

        <p>
          <span>⭐️</span>

          <span>{avgImdbRating}</span>
        </p>

        <p>
          <span>🌟</span>

          <span>{avgUserRating}</span>
        </p>

        <p>
          <span>⏳</span>

          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

//// watch_box -- watchmovieslist  //////////////////////////////////////////////////////////////////////

function Watchmovielist({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <Watchmovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

/// Watchmovie ////////////////////////////////////////////////////////////////////////////////////////

function Watchmovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />

      <h3>{movie.Title}</h3>

      <div>
        <p>
          <span>⭐️</span>

          <span>{movie.imdbRating}</span>
        </p>

        <p>
          <span>🌟</span>

          <span>{movie.userRating}</span>
        </p>

        <p>
          <span>⏳</span>

          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
