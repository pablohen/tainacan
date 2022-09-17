import { extendTheme } from "@chakra-ui/react";
import { SaasProvider } from "@saas-ui/react";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import SEO from "../../next-seo.config";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SaasProvider
      theme={extendTheme({
        fonts: {
          heading: "Poppins, sans-serif;",
          body: "Poppins, sans-serif;",
        },
      })}
    >
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </SaasProvider>
  );
}
export default MyApp;
