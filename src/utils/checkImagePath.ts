import type { Item, Items } from "@/services/tainacanService";

const DEFAULT_IMAGE = "/imgs/no-image.png";

export function checkImagePath(item: Item | Items): string {
	if (!item?.document_as_html) {
		return DEFAULT_IMAGE;
	}

	const html = item.document_as_html;

	if (html.includes(".pdf")) {
		return DEFAULT_IMAGE;
	}

	const imgSrcMatch = html.match(/src=["']([^"']+)["']/i);
	if (imgSrcMatch?.[1]) {
		return imgSrcMatch[1];
	}

	const imgHrefMatch = html.match(
		/href=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg))["']/i,
	);
	if (imgHrefMatch?.[1]) {
		return imgHrefMatch[1];
	}

	const anyImgMatch = html.match(
		/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i,
	);
	if (anyImgMatch?.[1]) {
		return anyImgMatch[1];
	}

	return DEFAULT_IMAGE;
}
