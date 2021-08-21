import axios from 'axios';
import Museums from '../models/museums';

// const api = 'https://www.limeira.sp.gov.br/museu/wp-json/tainacan/v2';
const query = 'items';
const parameters = 'perpage=96&paged=';
const searchParameters = '&metaquery[1][compare]=LIKE&metaquery[1][value]=';
//  "&fetch_only=thumbnail&metaquery[1][compare]=LIKE&metaquery[1][value]=";

const getItems = async (
  museumId: number,
  page: number = 1,
  searchTerm: string = ''
) => {
  const perpage = 50;
  const paged = page;
  const metaqueryCompare = 'LIKE';
  const metaqueryValue = searchTerm;
  try {
    const res = await axios.get(`${Museums[Number(museumId)].api}/items`, {
      params: {
        perpage,
        paged,
        'metaquery[1][compare]': metaqueryCompare,
        'metaquery[1][value]': metaqueryValue,
      },
    });
    const items = await res.data.items.map(
      ({ id, title, description, document_as_html }: any) => ({
        id,
        title,
        description,
        document_as_html,
      })
    );

    return await items;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const getItem = async (museumId: number, itemId: number) => {
  try {
    const res = await axios.get(`${Museums[museumId].api}/items/${itemId}`);
    const item = {
      id: res.data.id,
      title: res.data.title,
      description: res.data.description,
      document_as_html: res.data.document_as_html,
      metadata: res.data.metadata,
    };

    return item;
  } catch (error) {
    console.log(error.message);
    return {};
  }
};

const tainacanService = {
  getItems,
  getItem,
};

export default tainacanService;
