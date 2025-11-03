"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ItemMetadata } from "@/components/ItemMetadata";
import type { Item } from "@/services/tainacanService";
import { checkImagePath } from "@/utils/checkImagePath";

interface ItemPageProps {
	item: Item;
	museumId: string;
	museumName: string;
}

export default function ItemPageClient({
	item,
	museumId,
	museumName,
}: ItemPageProps) {
	const metadata = Object.entries(item?.metadata || {});
	const { title, description } = item;
	const imgPath = checkImagePath(item);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />
			<HeroBanner title={title} description={description} link="#" />

			<div className="flex flex-grow flex-col px-4 py-8">
				<div className="mx-auto w-full max-w-7xl space-y-6">
					<Link
						href={`/${museumId}`}
						className="inline-flex items-center gap-2 font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900"
					>
						<ArrowLeft className="h-5 w-5" />
						<span>Voltar para a coleção</span>
					</Link>

					<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<div className="flex flex-col lg:flex-row-reverse">
							<div className="flex items-center justify-center bg-gray-50 p-8 lg:w-1/2">
								<motion.img
									src={imgPath}
									alt={title}
									width={960}
									height={960}
									className="h-auto max-w-full rounded-lg"
									layoutId={String(item.id)}
								/>
							</div>

							<div className="space-y-6 p-8 lg:w-1/2">
								<div className="space-y-2 border-gray-200 border-b pb-4">
									<h1 className="font-bold text-2xl text-gray-900">
										Detalhes do Item
									</h1>
									<p className="text-gray-600 text-sm">{museumName}</p>
								</div>

								<div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto pr-2">
									{metadata.length > 0 ? (
										metadata.map((meta) => (
											<ItemMetadata
												key={`ItemMetadata__${crypto.randomUUID()}`}
												metadata={meta[1]}
											/>
										))
									) : (
										<div className="py-8 text-center">
											<p className="text-gray-500">
												Nenhum metadado disponível
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
