import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
	title: string;
	link?: string;
	description: string;
	background?: string;
	museumId?: string;
}

export function HeroBanner({
	title = "Lorem ipsum",
	link = "#",
	description = "",
	background = "bg-gray-50",
	museumId,
}: HeroBannerProps) {
	return (
		<div className={`${background} border-gray-200 border-b`}>
			<div className="flex flex-col items-center">
				<div className="w-full max-w-screen-2xl space-y-2 p-6">
					<div className="flex items-center justify-between gap-4">
						<h2 className="flex items-center gap-2 font-bold text-3xl text-gray-900 tracking-tight lg:text-5xl">
							{title}
							{museumId && (
								<FavoriteButton
									type="museum"
									museumId={museumId}
									className="h-12 w-12"
								/>
							)}
						</h2>
					</div>

					{description && (
						<p className="max-w-2xl text-base text-gray-600 leading-relaxed lg:text-lg">
							{description}
						</p>
					)}

					{link !== "#" && (
						<div className="pt-2">
							<Link href={link} passHref>
								<Button className="group flex cursor-pointer items-center gap-2 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800">
									<span>Ir para o site</span>
									<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
