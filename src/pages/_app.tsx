import { SaasProvider } from "@saas-ui/react";
import { DefaultSeo } from "next-seo";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import SEO from "../../next-seo.config";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SaasProvider>
      <ThemeProvider attribute="class">
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </ThemeProvider>
    </SaasProvider>
  );
}
export default MyApp;
