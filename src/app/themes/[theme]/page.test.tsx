import { expect, it } from "vitest";
import ThemePage from "./page";

it("re-encodes Next's decoded route parameter before client lookup", async () => {
	const page = await ThemePage({
		params: Promise.resolve({ theme: "100% art" }),
	});

	expect(page.props.themeKey).toBe("100%25%20art");
});
