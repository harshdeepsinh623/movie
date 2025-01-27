fetch(`https://api.themoviedb.org/3/movie/popular?api_key=52f6182037b25994d1c59e6780764026&page=1`)

.then((res) => {
    return res.json();
})
.then((data) =>{
    console.log(data);
    showMovies(data.results)
    pages(data.page)
})

fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=52f6182037b25994d1c59e6780764026`)

.then((res) =>{
    return res.json();
})
.then((data) =>{
    showgenre(data.genres)
})

function changePage(p){
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=2254f6a103ea45b2d2965212918395da&page=${p}`)
    .then((res) =>{
        return res.json();
    })
    .then((data) =>{
        console.log(data)
        showMovies(data.results)
        pages(data.page)
    })
}

document.getElementById("search").addEventListener("change", function(e){
    let search = e.target.value;
    console.log(search)

    fetch(`https://api.themoviedb.org/3/search/movie?api_key=52f6182037b25994d1c59e6780764026&query=${search}&page=1`)

    .then((res) =>{
        return res.json();
    })
    .then((data) =>{
        console.log(data)
        showMovies(data.results)
        pages(data.page)
    })
})

function pages(page){
    document.getElementById("pagination").innerHTML = `
    <ul class="pagination mx-auto" style="width:fit-content">
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous">
                  <span aria-hidden="true" onclick="changePage(${page-1})">Prev</span>
                </a>
              </li>
              <li class="page-item"><a class="page-link" href="#">${page}</a></li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">
                  <span aria-hidden="true" onclick="changePage(${page+1})">Next</span>
                </a>
              </li>
            </ul>
    `
}

function showMovies(data) {
    const moviesContainer = document.getElementById("movies");
    moviesContainer.innerHTML = ""; 

    data.map((ele) => {
        moviesContainer.innerHTML += `
            <div class="col-3">
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${ele.poster_path}" class="card-img-top" alt="${ele.title}">
                    <div class="card-body">
                        <h5 class="card-title">Name: ${ele.title}</h5>
                        <p class="card-text">Release-Date: ${ele.release_date}</p>
                        <div class="d-flex justify-content-between w-20">
                            <a href="#" class="btn btn-dark" onclick="watchTrailer('${ele.id}')">Watch Trailer</a>
                            <a href="#" class="btn btn-primary" onclick="showDetails(${ele.id})">Show Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
}   

function showDetails(movie) {
    const offCanvas = document.getElementById("offCanvas");
    offCanvas.innerHTML = `
        <button class="close-btn" onclick="closeOffCanvas()">&#10006;</button>
        <div class="details-content">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="details-poster">
            <h3>${movie.title}</h3>
            <p><strong>ID:</strong> ${movie.id}</p>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Popularity:</strong> ${movie.popularity}</p>
            <p><strong>Original Title:</strong> ${movie.original_title}</p>
            <p><strong>Vote Average:</strong> ${movie.vote_average}</p>
        </div>
    `;
    document.getElementById("offCanvasWrapper").classList.add("active");
}

function closeOffCanvas() {
    document.getElementById("offCanvasWrapper").classList.remove("active");
}

async function showDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=52f6182037b25994d1c59e6780764026`);
        const movie = await response.json();

        const offCanvas = document.getElementById("offCanvas");
        offCanvas.innerHTML = `
            <button class="close-btn" onclick="closeOffCanvas()">&#10006;</button>
            <div class="details-content">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="details-poster">
                <h3>${movie.title}</h3>
                <p><strong>ID:</strong> ${movie.id}</p>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Popularity:</strong> ${movie.popularity}</p>
                <p><strong>Original Title:</strong> ${movie.original_title}</p>
                <p><strong>Vote Average:</strong> ${movie.vote_average}</p>
            </div>
        `;
        document.getElementById("offCanvasWrapper").classList.add("active");
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

async function watchTrailer(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=52f6182037b25994d1c59e6780764026`);
        const data = await response.json();

        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");

        if (trailer) {
            
            const trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
            document.getElementById('trailerVideo').src = trailerUrl;

            const movieDetails = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=52f6182037b25994d1c59e6780764026`);
            const movieData = await movieDetails.json();

            document.getElementById('movieTitle').textContent = movieData.title;
            document.getElementById('movieReleaseDate').textContent = `Release Date: ${movieData.release_date}`;
            document.getElementById('movieOverview').textContent = `Overview: ${movieData.overview}`;

            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.remove();
            }

            const modal = new bootstrap.Modal(document.getElementById('movieModal'));
            modal.show();
        } else {
            
            const errorMessage = document.createElement('div');
            errorMessage.id = 'errorMessage';
            errorMessage.classList.add('alert', 'alert-danger');
            errorMessage.textContent = "Trailer not available for this movie.";

            const modalBody = document.querySelector('.modal-body');
            modalBody.appendChild(errorMessage);

            const modal = new bootstrap.Modal(document.getElementById('movieModal'));
            modal.show();
        }

    } catch (error) {
        console.error("Error fetching trailer:", error);
    }
}


function closeOffCanvas() {
    document.getElementById("offCanvasWrapper").classList.remove("active");
}


function showgenre(gen){
    gen.map((ele) => {
        document.getElementById("genre").innerHTML += `
        <option value="${ele.id}">${ele.name}</option>
        `
    })
}

document.getElementById("genre").addEventListener("change", function(e){
    console.log(e.target.value)

    fetch(`https://api.themoviedb.org/3/movie/${e.target.value}/similar?api_key=52f6182037b25994d1c59e6780764026`)

    .then((res) =>{
        return res.json();
    })

    .then((data) =>{
        console.log(data);
        showMovies(data.results)
    })
})