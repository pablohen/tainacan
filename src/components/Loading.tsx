import { Center } from "@astryxdesign/core/Center";
import { Spinner } from "@astryxdesign/core/Spinner";

export function Loading() {
	return (
		<Center minHeight={200}>
			<Spinner label="Carregando..." />
		</Center>
	);
}
