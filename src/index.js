import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchImages from './pixaby-api';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
let gallerySimpleLightbox = new SimpleLightbox('.gallery a');

let pageNumber = 1;
let currentHits = 0;
let searchQuery = '';
let isLoading = false;
let isLastPage = false;

function renderImageList(images) {
  const fragment = document.createDocumentFragment();
  images.forEach((image) => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');
    photoCard.innerHTML = `
      <a href="${image.largeImageURL}">
        <img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/>
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b> <span class="info-item-api">${image.likes}</span></p>
        <p class="info-item"><b>Views</b> <span class="info-item-api">${image.views}</span></p>
        <p class="info-item"><b>Comments</b> <span class="info-item-api">${image.comments}</span></p>
        <p class="info-item"><b>Downloads</b> <span class="info-item-api">${image.downloads}</span></p>
      </div>
    `;
    fragment.appendChild(photoCard);
  });
  gallery.appendChild(fragment);
}

searchForm.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.searchQuery.value.trim();
  pageNumber = 1;
  isLastPage = false;

  if (!searchQuery) {
    Notiflix.Notify.failure('Please write correct data!');
    return;
  }

  const response = await fetchImages(searchQuery, pageNumber);
  currentHits = response.hits.length;

  if (response.totalHits === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }

  if (response.totalHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
    gallery.innerHTML = '';
    renderImageList(response.hits);
    gallerySimpleLightbox.refresh();
  }
}

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

const observer = new IntersectionObserver(loadMoreImages, options);
observer.observe(document.querySelector('.photo-card:last-child'));

function loadMoreImages(entries) {
  if (entries[0].isIntersecting && !isLoading && currentHits > 0 && !isLastPage) {
    isLoading = true;
    pageNumber += 1;
    fetchImages(searchQuery, pageNumber)
      .then((response) => {
        if (response.hits.length === 0) {
          isLastPage = true;
        } else {
          renderImageList(response.hits);
          gallerySimpleLightbox.refresh();
          currentHits += response.hits.length;
          isLoading = false;
        }
      })
      .catch((error) => {
        console.error(error);
        isLoading = false;
      });
  }
}
