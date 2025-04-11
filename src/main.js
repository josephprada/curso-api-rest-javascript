// API Configuration
const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'content-type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': api_key,
    }
});

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    body.setAttribute('data-theme', savedTheme);

    // Set initial button text
    themeToggle.textContent = savedTheme === 'dark' ? '🌞' : '🌙';

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌞' : '🌙';
    });
}
initializeThemeToggle();

// Utils

function createMovies(movies, container, clean) {

 
    // Limpiar skeletons
    const skeletons = container.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => skeleton.classList.add('inactive'));

    if (clean) {

        container.innerHTML = '';
    }

    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        movieContainer.addEventListener('click', () => {
            location.hash = `#movie=${movie.id}`;
        });

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute('loading', 'lazy'); // Lazy loading nativo

        // Usar data-src en lugar de src
        movieImg.dataset.src = movie.poster_path
            ? 'https://image.tmdb.org/t/p/w300' + movie.poster_path
            : 'https://via.placeholder.com/300x450?text=No+Poster';

        // Placeholder inicial (imagen transparente 1x1)
        movieImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';

        // Efecto de carga
        movieImg.onload = () => {
            movieImg.classList.add('loaded');
        };

        // Manejo de errores
        movieImg.onerror = () => {
            movieImg.src = 'https://img.freepik.com/free-vector/glitch-error-404-page-background_23-2148090410.jpg?semt=ais_hybrid&w=740';
            movieImg.onerror = null; // Prevenir bucles
        };

        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });

    // Activar IntersectionObserver para estas imágenes
    setupLazyLoadingForContainer(container);
}


function createCategories(categories, container) {

    const skeletons = container.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => {
        skeleton.classList.add('inactive');
    });

    container.innerHTML = '';

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        categoryContainer.id = `id${category.id}`;

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.textContent = category.name;
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
            headerCategoryTitle.innerHTML = category.name;
        });

        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });

}

// Llamados a la API

async function getTrendingMoviesPreview() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    console.log(movies)

    createMovies(movies, trendingMoviesPreviewList, true);
}

async function getCategegoriesPreview() {
    const { data } = await api('genre/movie/list');
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id) {
    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;

    maxPage = data.total_pages;

    createMovies(movies, genericSection, true);
}

function getPaginatedCategoriesMovies(id) {

    return async function () {
        const {
            scrollTop,
            scrollHeight,
            clientHeight,
        } = document.documentElement;

        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);

        const pageIsMax = page < maxPage;

        if (scrollIsBottom && pageIsMax) {
            page++;
            const { data } = await api('discover/movie', {
                params: {
                    with_genres: id,
                    page,
                },
            });
            const movies = data.results;

            createMovies(movies, genericSection, false);
        }
    }
}

async function getMoviesBySearch(query) {
    const { data } = await api('search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;

    maxPage = data.total_pages;
    console.log(maxPage);

    createMovies(movies, genericSection, true);
}
function getPaginatedSearchMovies(query) {

    return async function () {
        const {
            scrollTop,
            scrollHeight,
            clientHeight,
        } = document.documentElement;

        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);

        const pageIsMax = page < maxPage;

        if (scrollIsBottom && pageIsMax) {
            page++;
            const { data } = await api('search/movie', {
                params: {
                    query,
                    page,
                },
            });
            const movies = data.results;

            createMovies(movies, genericSection, false);
        }
    }
}

async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    maxPage = data.total_pages;

    createMovies(movies, genericSection, true );

}

async function getPaginatedTrendingMovies() {

    const {
        scrollTop,
        scrollHeight,
        clientHeight,
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);

    const pageIsMax = page < maxPage;

    if (scrollIsBottom && pageIsMax) {
        page++;
        const { data } = await api('trending/movie/day', {
            params: {
                page,
            },
        });
        const movies = data.results;

        createMovies(movies, genericSection, false);
    }
}

async function getMovieById(id) {
    
    const { data: movie } = await api('movie/' + id);

    // Configurar el fondo del header
    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    headerSection.style.background = `
        linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.35) 19.27%,
            rgba(0, 0, 0, 0) 29.17%
        ),
        url(${movieImgUrl}) 50% 30%/cover no-repeat
    `;

    // Llenar los datos
    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    // Crear categorías
    createCategories(movie.genres, movieDetailCategoriesList, true);

    // Obtener películas relacionadas
    await getRelatedMoviesId(id, document.querySelector('.relatedMovies-scrollContainer'));

    // Mostrar contenido
    movieDetailSection.classList.add('active');

}

async function getRelatedMoviesId(id, container) {
        // Limpiar contenedor
        container.innerHTML = '';

        // Mostrar skeleton temporal
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton skeleton-movie';
        container.appendChild(skeleton);

        const { data } = await api(`movie/${id}/recommendations`);
        const relatedMovies = data.results;

        // Eliminar skeleton y mostrar películas
        container.innerHTML = '';
        createMovies(relatedMovies, container, true);
}
function setupLazyLoadingForContainer(container) {
    const lazyImages = container.querySelectorAll('.movie-img[data-src]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        lazyImages.forEach(img => observer.observe(img));
    } else {
        lazyImages.forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
        });
    }
}