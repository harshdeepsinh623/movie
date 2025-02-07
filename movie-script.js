document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = '52f6182037b25994d1c59e6780764026';
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

    const createElement = (tag, className) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    };

    const loadMovie = async () => {
        const movie = JSON.parse(localStorage.getItem("selectedMovie"));
        
        if (!movie) {
            document.innerHTML = `<div class="container text-center mt-5">
                <h2>No Movie Selected</h2>
                <a href="index.html" class="btn btn-primary mt-3">Back to Home</a>
            </div>`;
            return;
        }

        document.getElementById("poster").src = `${IMG_PATH}${movie.poster_path}`;
        document.getElementById("title").textContent = movie.title;
        document.getElementById("rating").textContent = `${movie.vote_average}/10`;
        document.getElementById("releaseDate").textContent = formatDate(movie.release_date);
        document.getElementById("description").textContent = movie.overview;

        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits,videos,similar,reviews,images`);
            const data = await response.json();

            document.getElementById("genres").textContent = data.genres.map(genre => genre.name).join(", ");
            document.getElementById("runtime").textContent = data.runtime + " mins";

            const castContainer = document.getElementById("cast");
            data.credits.cast.slice(0, 8).forEach(actor => {
                if (actor.profile_path) {
                    const actorElement = createElement('div', 'cast-member');
                    actorElement.innerHTML = `<img src="${IMG_PATH}${actor.profile_path}" alt="${actor.name}" loading="lazy">
                    <p>${actor.name}</p>`;
                    castContainer.appendChild(actorElement);
                }
            });

            const trailer = data.videos.results.find(video => video.type === "Trailer");
            if (trailer) {
                document.getElementById("trailer").innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen loading="lazy"></iframe>`;
            }

            const otherPosters = document.getElementById("otherPosters");
            data.images.backdrops.slice(0, 6).forEach(img => {
                const imgElement = createElement('img');
                imgElement.src = `${IMG_PATH}${img.file_path}`; 
                imgElement.alt = "Movie Scene";
                imgElement.loading = "lazy";
                otherPosters.appendChild(imgElement);
            });

            const similarMovies = document.getElementById("similarMovies");
            data.similar.results.slice(0, 6).forEach(similar => {
                if (similar.poster_path) {
                    const similarElement = createElement('div', 'similar-movie');
                    similarElement.innerHTML = `<img src="${IMG_PATH}${similar.poster_path}" alt="${similar.title}" loading="lazy">
                    <p>${similar.title}</p>`;
                    similarMovies.appendChild(similarElement);
                }
            });

            const reviewsContainer = document.getElementById("reviews");
            if (data.reviews.results.length > 0) {
                data.reviews.results.slice(0, 3).forEach(review => {
                    const reviewItem = createElement('div', 'review-item');
                    reviewItem.innerHTML = `<p><strong>${review.author}</strong>: ${review.content.substring(0, 200)}${review.content.length > 200 ? '...' : ''}</p>`;
                    reviewsContainer.appendChild(reviewItem);
                });
            } else {
                reviewsContainer.innerHTML = '<p class="text-muted">No reviews available.</p>';
            }

        } catch (error) {
            console.error("Error loading movie details:", error);
            document.body.innerHTML = `<div class="container text-center mt-5">
                <h2>Error Loading Movie Details</h2>
                <p class="text-danger">${error.message}</p>
                <a href="index.html" class="btn btn-primary mt-3">Back to Home</a>
            </div>`;
        }
    };

    loadMovie();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });
});
