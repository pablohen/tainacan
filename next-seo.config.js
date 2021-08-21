const site = `https://${process.env.VERCEL_URL}`;
const siteName = 'Tainacan - Casos de Uso';
const description = 'Portfólio dos casos de uso do Tainacan';

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
