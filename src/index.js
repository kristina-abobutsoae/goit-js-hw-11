import './styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '38949449-ae35dfbac73a768ce8b6a56b1';
const input = document.querySelector('input[name="searchQuery"]');
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
let gallerySimpleLightbox = new SimpleLightbox('.photo-card a');
const btnLoad = document.querySelector('.load-more');
// btnLoad.hidden = true;
let page = 1;
const btnSearch = document.querySelector('.search-form-button');
const per_page = 40;

async function fetchQuery(inputValue, page = 1) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=32824197-fdf9de1b54cd092b4fe49e40b&q=${inputValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

btnLoad.style.display = 'none';

async function onSearch(evn) {
  evn.preventDefault();

  const inputValue = input.value.trim();

  page = 1;
  if (inputValue === '') {
    cleanHtml();
    return;
  }

  const response = await fetchQuery(inputValue, page);

  try {
    if (response.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      btnLoad.style.display = 'none';
      
    } else {
      gallery.innerHTML = '';
      renderImageList(response.hits);
      Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
      btnLoad.style.display = 'block';
      gallerySimpleLightbox.refresh();
    }
  } catch {
    err => console.log(err);
  }
}

  form.addEventListener('submit', onSearch);

  function cleanHtml() {
    gallery.innerHTML = '';
    page = 1;
  }

  function renderImageList(imagesCard) {
    // console.log(imagesCard);
    const markup = imagesCard
      .map(image => {
        return `<div class="photo-card">
      <a href="${image.largeImageURL}"><img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/></a>
       <div class="info">
          <p class="info-item">
   <b>Likes</b> <span class="info-item-api"> ${image.likes} </span>
</p>
           <p class="info-item">
               <b>Views</b> <span>${image.views}</span>  
           </p>
           <p class="info-item">
               <b>Comments</b> <span>${image.comments}</span>  
           </p>
           <p class="info-item">
               <b>Downloads</b> <span>${image.downloads}</span> 
           </p>
       </div>
   </div>`;
      })
      .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
  }

  btnLoad.addEventListener('click', onLoad);

  async function onLoad() {
    page += 1;
    const inputValue = input.value.trim();

    const response = await fetchQuery(inputValue, page);
    try {
      if (response.totalHits < page * per_page) {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        btnLoad.style.display = 'none';
      }
      renderImageList(response.hits);
    } catch {
      err => console.log(err);
    }
  }
