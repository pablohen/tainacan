export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-gray-200 border-t bg-white">
			<div className="flex flex-col items-center justify-center px-6 py-12">
				<p className="text-gray-600 text-sm">{`Tainacan © ${currentYear}`}</p>
			</div>
		</footer>
	);
}
