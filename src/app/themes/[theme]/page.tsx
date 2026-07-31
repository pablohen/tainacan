import type { Metadata } from "next";
import { ThemePageClient } from "./ThemePageClient";

interface ThemePageProps {
	params: Promise<{
		theme: string;
	}>;
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Explore theme",
	};
}

export default async function ThemePage({ params }: ThemePageProps) {
	const { theme } = await params;

	return <ThemePageClient themeKey={theme} />;
}
