import type { Metadata } from "next";
import { getMuseumById } from "@/utils/museums";

interface MuseumPageProps {
	params: Promise<{
		museumId: string;
	}>;
}

export async function generateMetadata({
	params,
}: MuseumPageProps): Promise<Metadata> {
	const { museumId } = await params;
	const museum = getMuseumById(museumId);

	if (!museum) {
		return {
			title: "Museu não encontrado",
		};
	}

	return {
		title: museum.title,
		description: museum.description,
		openGraph: {
			title: museum.title,
			description: museum.description,
			type: "website",
		},
	};
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
