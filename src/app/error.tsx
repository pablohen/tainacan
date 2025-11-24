"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
			<div className="w-full max-w-md animate-fade-in space-y-6">
				<Alert variant="destructive" className="rounded-xl border">
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle className="font-bold text-lg">
						Algo deu errado!
					</AlertTitle>
					<AlertDescription className="mt-2 text-sm">
						{error.message || "Ocorreu um erro inesperado."}
					</AlertDescription>
				</Alert>

				<div className="flex justify-center">
					<Button
						onClick={reset}
						className="rounded-full bg-gray-900 text-white transition-colors duration-200 hover:bg-gray-800"
					>
						Tentar novamente
					</Button>
				</div>
			</div>
		</div>
	);
}
