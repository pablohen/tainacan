import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMuseumById } from "@/utils/museums";

interface MuseumLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		museumId: string;
	}>;
}

export async function generateMetadata({
	params,
}: MuseumLayoutProps): Promise<Metadata> {
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

export default async function Layout({ children, params }: MuseumLayoutProps) {
	const { museumId } = await params;

	if (!getMuseumById(museumId)) {
		notFound();
	}

	return children;
}
