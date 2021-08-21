/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
const isVisible = (item, searchTerm) =>
  !!(
    String(item.id).includes(searchTerm?.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm?.toLowerCase())
  );

export default isVisible;
