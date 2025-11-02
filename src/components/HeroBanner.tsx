import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
	title: string;
	link?: string;
	description: string;
	background?: string;
}

export function HeroBanner({
	title = "Lorem ipsum",
	link = "#",
	description = "",
	background = "bg-gray-50",
}: HeroBannerProps) {
	return (
		<div className={`${background} border-gray-200 border-b`}>
			<div className="flex flex-col items-center">
				<div className="w-full max-w-5xl space-y-6 px-6 py-16 sm:px-8 sm:py-24 lg:px-12">
					<div className="flex items-center gap-3">
						<h2 className="font-bold text-4xl text-gray-900 tracking-tight lg:text-6xl">
							{title}
						</h2>
					</div>

					{description && (
						<p className="max-w-2xl text-gray-600 text-lg leading-relaxed lg:text-xl">
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
