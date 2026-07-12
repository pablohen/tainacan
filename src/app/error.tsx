"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { useEffect } from "react";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Center minHeight={320}>
			<VStack gap={4} maxWidth={448} hAlign="center">
				<Banner
					status="error"
					title="Algo deu errado!"
					description={error.message || "Ocorreu um erro inesperado."}
					container="card"
				/>
				<Button label="Tentar novamente" variant="primary" onClick={reset} />
			</VStack>
		</Center>
	);
}
