import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
			<div className="w-full max-w-md animate-fade-in space-y-6">
				{/* Gradient background effect */}
				<div className="-z-10 absolute inset-0 overflow-hidden">
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 opacity-30 blur-3xl" />
				</div>

				<Alert className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-gray-50 shadow-[0_20px_60px_rgb(0,0,0,0.15)]">
					<FileQuestion className="h-5 w-5 text-primary" />
					<AlertTitle className="font-bold text-gray-900 text-xl">
						Item não encontrado
					</AlertTitle>
					<AlertDescription className="mt-2 text-gray-600 text-sm">
						O item que você está procurando não existe ou foi removido.
					</AlertDescription>
				</Alert>

				<div className="flex justify-center">
					<Button
						asChild
						className="rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)]"
					>
						<Link href="/">Voltar para o início</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
