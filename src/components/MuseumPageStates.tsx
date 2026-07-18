import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";

interface MuseumQueryErrorBannerProps {
	title: string;
	description: string;
	onRetry: () => void;
}

export function MuseumQueryErrorBanner({
	title,
	description,
	onRetry,
}: MuseumQueryErrorBannerProps) {
	return (
		<Banner
			status="error"
			title={title}
			description={description}
			container="card"
			endContent={<Button label="Tentar novamente" onClick={onRetry} />}
		/>
	);
}
