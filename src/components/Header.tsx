import Link from "next/link";
import { MuseumList } from "./MuseumList";

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-gray-200/80 border-b bg-white/95 backdrop-blur-sm">
			<div className="mx-auto flex max-w-screen-2xl items-center">
				<div className="flex flex-col items-center justify-between px-6 py-5 sm:flex-row">
					<Link
						href="/"
						className="group flex items-center gap-2 font-semibold text-2xl text-gray-900 transition-colors duration-200 hover:text-gray-600"
					>
						Tainacan
					</Link>
				</div>
				<MuseumList />
			</div>
		</header>
	);
}
