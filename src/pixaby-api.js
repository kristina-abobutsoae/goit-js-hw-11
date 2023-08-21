import axios from "axios";
axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '38949449-ae35dfbac73a768ce8b6a56b1';

axios.defaults.baseURL = 'https://pixabay.com/api/';

async function fetchImages (searchQuery,page,limit) {
   
    const response =  await axios(`?key=${KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${limit}`);
    return response.data;
    
  }
export {fetchImages};