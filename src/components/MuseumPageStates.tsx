import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";

interface MuseumQueryErrorBannerProps {
	title: string;
	description: string;
	onRetry: () => void;
	retryLabel?: string;
}

export function MuseumQueryErrorBanner({
	title,
	description,
	onRetry,
	retryLabel = "Tentar novamente",
}: MuseumQueryErrorBannerProps) {
	return (
		<Banner
			status="error"
			title={title}
			description={description}
			container="card"
			endContent={<Button label={retryLabel} onClick={onRetry} />}
		/>
	);
}
