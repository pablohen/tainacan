"use client";

import dynamic from "next/dynamic";

const ReactQueryDevtoolsProduction = dynamic(
	() =>
		import("@tanstack/react-query-devtools").then((mod) => ({
			default: mod.ReactQueryDevtools,
		})),
	{ ssr: false },
);

export function ReactQueryDevtools() {
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return <ReactQueryDevtoolsProduction initialIsOpen={false} />;
}
