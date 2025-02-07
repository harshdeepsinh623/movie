let movie_api = `https://api.themoviedb.org/3`;
let key = `?api_key=52f6182037b25994d1c59e6780764026`;
let movie_endpoint = `discover/movie`;
let tv_endpoint = `tv/popular`;

let type = localStorage.getItem("selectedType") || "movie"; 
let lang = JSON.parse(localStorage.getItem("selectedLanguage")) || [];
let page = 1;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(`input[value="${type}"]`).checked = true;
    fetchMovies();
    fetchGenres();
    fetchLanguages();

    document.querySelectorAll("input[name='btnradio']").forEach((btn) => {
        btn.addEventListener("change", (e) => {
            type = e.target.value;
            localStorage.setItem("selectedType", type);
            fetchMovies();
            fetchGenres();
        });
    });

    document.getElementById("language-select").addEventListener("change", (e) => {
        let selectedLanguage = e.target.value;
        if (!lang.includes(selectedLanguage)) {
            lang.push(selectedLanguage);
            localStorage.setItem("selectedLanguage", JSON.stringify(lang));
            fetchMovies();
        }
    });
});

function fetchMovies() {
    let endpoint = type === "movie" ? movie_endpoint : tv_endpoint;
    let languageQuery = lang.length > 0 ? `&with_original_language=${lang.join("|")}` : "";

    fetch(`${movie_api}/${endpoint}${key}${languageQuery}&page=${page}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.results) {
                showMovies(data.results);
                pages(data.page);
            }
        })
        .catch((err) => console.error("Error fetching movies:", err));
}

function changePage(p) {
    page = p;
    fetchMovies();
}

document.getElementById("search").addEventListener("input", function (e) {
    let search = e.target.value.trim();
    if (search.length > 0) {
        let searchType = type === "movie" ? "movie" : "tv";
        fetch(`${movie_api}/search/${searchType}${key}&query=${search}`)
            .then((res) => res.json())
            .then((data) => {
                showMovies(data.results);
                pages(data.page);
            })
            .catch((err) => console.error("Error searching:", err));
    }
});

let langDropdown = document.getElementById("language-select");

function fetchLanguages() {
    fetch(`${movie_api}/configuration/languages${key}`)
        .then((res) => res.json())
        .then((data) => {
            langDropdown.innerHTML = `<option value="" disabled selected>Select Language</option>`;
            data.forEach((lan) => {
                langDropdown.innerHTML += `<option value="${lan.iso_639_1}">${lan.english_name}</option>`;
            });
        })
        .catch((err) => console.error("Error fetching languages:", err));
}

function showMovies(data) {
    const moviesContainer = document.getElementById("movie-list");
    if (!moviesContainer) return;
    moviesContainer.innerHTML = "";

    if (data.length === 0) {
        moviesContainer.innerHTML = `<p>No movies or shows found in the selected language.</p>`;
        return;
    }

    data.forEach((ele) => {
        let poster = ele.poster_path ? `https://image.tmdb.org/t/p/w500${ele.poster_path}` : "no-image.jpg";
        let title = ele.title || ele.name || "Unknown Title";
        let overview = ele.overview ? ele.overview.substring(0, 100) + "..." : "No description available.";
        let rating = ele.vote_average ? ele.vote_average.toFixed(1) : "N/A";
        let releaseDate = ele.release_date || ele.first_air_date || "Unknown Release Date";

        moviesContainer.innerHTML += `
            <div class="col-md-3">
                <div class="card">
                    <img src="${poster}" class="card-img-top" alt="${title}">
                    <div class="card-body">
                        <a href="movie-details.html" class="movie-link" data-movie='${JSON.stringify(ele)}'>
                            <h5 class="card-title">${title}</h5>
                        </a>
                        <p class="card-text">Rating: ⭐ ${rating}</p>
                        <p class="card-text">Release Date: ${releaseDate}</p>
                    </div>
                </div>
            </div>`;
    });

    document.querySelectorAll(".movie-link").forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            let movieData = JSON.parse(this.getAttribute("data-movie"));
            localStorage.setItem("selectedMovie", JSON.stringify(movieData));
            window.location.href = "movie-details.html";
        });
    });
}

function pages(page) {
    document.getElementById("pagination").innerHTML = `
        <ul class="pagination mx-auto">
            <li class="page-item ${page === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="changePage(${page - 1})">Prev</a>
            </li>
            <li class="page-item"><a class="page-link">${page}</a></li>
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${page + 1})">Next</a>
            </li>
        </ul>`;
}

function fetchGenres() {
    fetch(`${movie_api}/genre/${type}/list${key}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.genres) {
                document.getElementById("genre-buttons").innerHTML = data.genres.map(
                    (ele) => `<button class="btn btn-outline-primary m-2" onclick="filterByGenre(${ele.id})">${ele.name}</button>`
                ).join("");
            }
        })
        .catch((err) => console.error("Error fetching genres:", err));
}

function filterByGenre(genreId) {
    let discoverType = type === "movie" ? "discover/movie" : "discover/tv";
    let selectedLang = lang.length > 0 ? `&with_original_language=${lang.join("|")}` : "";
    
    fetch(`${movie_api}/${discoverType}${key}&with_genres=${genreId}${selectedLang}`)
        .then((res) => res.json())
        .then((data) => {
            showMovies(data.results);
        })
        .catch((err) => console.error("Error filtering by genre:", err));
}
