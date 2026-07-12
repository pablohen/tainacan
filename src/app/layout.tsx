import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import { Providers } from "./providers";
import "../styles/globals.css";

export const metadata: Metadata = {
	title: {
		default: "Tainacan - Casos de Uso",
		template: "%s | Tainacan",
	},
	description:
		"Lugares onde o sistema foi implementado e pode ser visualizado.",
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: {
		type: "website",
		locale: "pt_BR",
		siteName: "Tainacan - Casos de Uso",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body>
				<Providers>
					<AppChrome>{children}</AppChrome>
				</Providers>
			</body>
		</html>
	);
}
