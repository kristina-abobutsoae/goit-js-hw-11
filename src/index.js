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
  const markup = images
    .map(image => {
      return `<div class="photo-card">
       <a href="${image.largeImageURL}"><img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/></a>
        <div class="info">
           <p class="info-item">
    <b>Likes</b> <span class="info-item-api"> ${image.likes} </span>
</p>
            <p class="info-item">
                <b>Views</b> <span class="info-item-api">${image.views}</span>
            </p>
            <p class="info-item">
                <b>Comments</b> <span class="info-item-api">${image.comments}</span>
            </p>
            <p class="info-item">
                <b>Downloads</b> <span class="info-item-api">${image.downloads}</span>
            </p>
        </div>
    </div>`;
    })
    .join('');

  gallery.innerHTML = markup;
}

searchForm.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.searchQuery.value.trim();
  pageNumber = 1;

  if (!searchQuery) {
    Notiflix.Notify.failure('Please write correct data!');
    return;
  }

  const response = await fetchImages(searchQuery, pageNumber);

  if (response.totalHits === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  } else {
    renderImageList(response.hits);
    gallerySimpleLightbox.refresh();

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoading) {
          loadMoreImages();
        }
      });
    }, {
      root: document.querySelector('.gallery'),
      threshold: 0.9
    });
    observer.observe(gallery);
  }
}

function loadMoreImages() {
  if (!isLoading) {
    isLoading = true;
    const nextPageNumber = Math.min(currentHits + 10, response.totalHits);
    if (nextPageNumber > pageNumber) {
      pageNumber = nextPageNumber;
      fetchImages(searchQuery, pageNumber)
        .then(response => {
          currentHits += response.hits.length;
          if (currentHits < response.totalHits) {
            renderImageList(response.hits);
          } else {
            isLastPage = true;
          }
          isLoading = false;
        })
        .catch(error => {
          console.error(error);
          isLoading = false;
        });
    }
  }
}
