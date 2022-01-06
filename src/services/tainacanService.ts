import axios, { AxiosError } from 'axios';
import { ItemDTO, Metadata } from '../interfaces/ItemDTO';
import { ItemsDTO } from '../interfaces/ItemsDTO';
import Museums from '../utils/museums';

export interface Items {
  id: number;
  title: string;
  description: string;
  document_as_html: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  document_as_html: string;
  metadata: Metadata;
}
export interface FormattedItemsRes {
  items: Items[];
  wpTotal: number;
  wpTotalPages: number;
}

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
    const wpTotal = res.headers['x-wp-total'] as unknown as number;
    const wpTotalPages = res.headers['x-wp-totalpages'] as unknown as number;
    const results = (await res.data) as ItemsDTO;
    const items: Items[] = results.items.map(
      ({ id, title, description, document_as_html }) => ({
        id,
        title,
        description,
        document_as_html,
      })
    );

    const data: FormattedItemsRes = {
      items,
      wpTotal,
      wpTotalPages,
    };

    return data;
  } catch (error) {
    const AxiosError = error as AxiosError;
    console.log(AxiosError.message);
    return [];
  }
};

const getItem = async (museumId: number, itemId: number) => {
  try {
    const res = await axios.get<ItemDTO>(
      `${Museums[museumId].api}/items/${itemId}`
    );
    const item: Item = {
      id: res.data.id,
      title: res.data.title,
      description: res.data.description,
      document_as_html: res.data.document_as_html,
      metadata: res.data.metadata,
    };

    return item;
  } catch (error) {
    const AxiosError = error as AxiosError;
    console.log(AxiosError.message);
    return {};
  }
};

const tainacanService = {
  getItems,
  getItem,
};

export default tainacanService;
