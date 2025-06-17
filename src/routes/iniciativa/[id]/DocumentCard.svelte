<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card/index.js';
	import type { FullInitiativeResponse } from '../../api/initiatives/[id]/+server';

	let { initiative }: { initiative: FullInitiativeResponse } = $props();

	function formatDate(dateStr: string | null) {
		if (!dateStr) return 'Data não disponível';
		return new Date(dateStr).toLocaleDateString('pt-PT', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function getVoteResults(votes: any[]) {
		const results = {
			favor: votes.filter(v => v.vote === 'favor').length,
			against: votes.filter(v => v.vote === 'against').length,
			abstention: votes.filter(v => v.vote === 'abstention').length,
		};

		const total = results.favor + results.against + results.abstention;

		return {
			...results,
			total,
			favorPercent: total > 0 ? Math.round((results.favor / total) * 100) : 0,
			againstPercent:
				total > 0 ? Math.round((results.against / total) * 100) : 0,
			abstentionPercent:
				total > 0 ? Math.round((results.abstention / total) * 100) : 0,
		};
	}

	let voteResults = initiative?.votes ? getVoteResults(initiative.votes) : null;
</script>

<Card>
	<CardHeader>
		<CardTitle>Documentos Anexos</CardTitle>
		<CardDescription>
			Documentos relacionados com esta iniciativa
		</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-3">
			{#each initiative.documents as doc (doc.id)}
				<div
					class="flex items-center justify-between p-3 border rounded-lg"
				>
					<div class="flex items-center space-x-3">
						<div
							class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center"
						>
							📄
						</div>
						<div>
							<div class="font-medium">{doc.original_filename}</div>
							<div class="text-sm text-gray-500">
								{Math.round(doc.file_size / 1024)} KB • {formatDate(
									doc.uploaded_at,
								)}
							</div>
						</div>
					</div>
					<Button variant="outline" size="sm">Descarregar</Button>
				</div>
			{/each}
		</div>
	</CardContent>
</Card>