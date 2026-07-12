import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { Link } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/VStack";

export default function NotFound() {
	return (
		<Center minHeight={320}>
			<VStack gap={4} maxWidth={448} hAlign="center">
				<Banner
					status="warning"
					title="Item não encontrado"
					description="O item que você está procurando não existe ou foi removido."
					container="card"
				/>
				<Link href="/" isStandalone>
					Voltar para o início
				</Link>
			</VStack>
		</Center>
	);
}
