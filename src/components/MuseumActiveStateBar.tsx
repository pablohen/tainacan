"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Token } from "@astryxdesign/core/Token";
import { VStack } from "@astryxdesign/core/VStack";
import type { ActiveStateChip } from "@/utils/activeStateChips";

export type MuseumActiveStateBarProps = {
	chips: ActiveStateChip[];
	onRemove: (id: string) => void;
	onClearAll: () => void;
};

export function MuseumActiveStateBar({
	chips,
	onRemove,
	onClearAll,
}: MuseumActiveStateBarProps) {
	if (chips.length === 0) {
		return null;
	}

	return (
		<VStack gap={2} width="100%">
			<HStack gap={2} wrap="wrap" vAlign="center">
				{chips.map((chip) => (
					<Token
						key={chip.id}
						label={chip.label}
						size="sm"
						onRemove={() => onRemove(chip.id)}
					/>
				))}
				<Button
					variant="secondary"
					size="sm"
					label="Limpar tudo"
					onClick={onClearAll}
				/>
			</HStack>
		</VStack>
	);
}
