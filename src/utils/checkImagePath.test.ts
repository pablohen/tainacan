import { describe, expect, it } from "vitest";
import type { TainacanItem } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";

function makeItem(document_as_html: string | undefined): TainacanItem {
	return {
		id: 1,
		title: "Test",
		description: "",
		document_as_html: document_as_html ?? "",
		metadata: {},
	};
}

describe("checkImagePath", () => {
	it("returns default when document is missing", () => {
		expect(checkImagePath(makeItem(undefined))).toBe("/imgs/no-image.png");
	});

	it("extracts src from img tag", () => {
		expect(
			checkImagePath(
				makeItem('<img src="https://example.com/photo.jpg" alt="x" />'),
			),
		).toBe("https://example.com/photo.jpg");
	});

	it("returns default for pdf documents", () => {
		expect(checkImagePath(makeItem('<a href="file.pdf">PDF</a>'))).toBe(
			"/imgs/no-image.png",
		);
	});
});
