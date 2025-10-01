import axios from "axios";
import type { ItemDTO } from "../interfaces/ItemDTO";
import type { Metadata } from "../interfaces/ItemDTO";
import type { ItemsDTO } from "../interfaces/ItemsDTO";
import { museums } from "../utils/museums";

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
  searchTerm: string = ""
): Promise<FormattedItemsRes | null> => {
  const perpage = 50;
  const paged = page;

  // Check if museumId is valid (including 0)
  if (museumId === undefined || museumId === null || isNaN(museumId)) {
    return null;
  }

  // Check if museum exists in the museums array
  if (!museums[museumId]) {
    return null;
  }

  try {
    const apiUrl = `${museums[museumId].api}/items`;

    const params: Record<string, any> = {
      perpage,
      paged,
    };

    // Add search parameter if searchTerm is provided
    if (searchTerm && searchTerm.trim() !== "") {
      params.search = searchTerm.trim();
    }

    const res = await axios.get(apiUrl, { params });

    const wpTotal = res.headers["x-wp-total"] as unknown as number;
    const wpTotalPages = res.headers["x-wp-totalpages"] as unknown as number;
    const results = res.data as ItemsDTO;

    if (!results.items || !Array.isArray(results.items)) {
      return null;
    }

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
      wpTotal: Number(wpTotal) || 0,
      wpTotalPages: Number(wpTotalPages) || 1,
    };

    return data;
  } catch (error) {
    return null;
  }
};

const getItem = async (
  museumId: number,
  itemId: number
): Promise<Item | null> => {
  try {
    const res = await axios.get<ItemDTO>(
      `${museums[museumId].api}/items/${itemId}`
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
    return null;
  }
};

export const tainacanService = {
  getItems,
  getItem,
};
