import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";

export default function MuseumNotFoundPage() {
	return (
		<Center minHeight={240}>
			<Banner
				status="error"
				title="Museu não encontrado"
				description="O museu que você está procurando não existe."
				container="card"
			/>
		</Center>
	);
}
