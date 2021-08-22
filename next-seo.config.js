const site = `https://${process.env.VERCEL_URL}`;
const siteName = 'Tainacan - Casos de Uso';
const description =
  'Projeto pessoal para agregar conteúdo de diversos sites que estão usando a ferramenta Tainacan, disponível para WordPress.';

const seoConfig = {
  defaultTitle: siteName,
  titleTemplate: `%s | ${siteName}`,
  description,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    site_name: siteName,
    description,
    images: [
      {
        url: `${site}/logo.png`,
      },
    ],
  },
};

export default seoConfig;
