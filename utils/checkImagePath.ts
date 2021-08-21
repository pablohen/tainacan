const checkImagePath = (item: any) => {
  if (item?.document_as_html?.split("src='")[1]) {
    return item.document_as_html.split("src='")[1]?.split("'")[0];
  }

  if (item?.document_as_html?.split("href='")[1]) {
    return item.document_as_html.split("href='")[1]?.split("'")[0];
  }

  if (item?.document_as_html?.includes('.pdf')) {
    return '/imgs/no-image.png';
  }

  return '/imgs/no-image.png';
};

export default checkImagePath;
