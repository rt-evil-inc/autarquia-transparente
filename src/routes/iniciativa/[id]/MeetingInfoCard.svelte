<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';

	interface Initiative {
		proposal_number: string | null;
		proposal_type?: string | null;
		meeting_number: number | null;
		meeting_date?: string | null;
		meeting_type?: string | null;
		meeting_notes?: string | null;
	}

	interface Props {
		initiative: Initiative;
		formatDate: (dateStr: string | null) => string;
	}

	let { initiative, formatDate }: Props = $props();
</script>

<!-- Meeting Information -->
{#if initiative.proposal_number || initiative.proposal_type || initiative.meeting_number || initiative.meeting_date || initiative.meeting_type || initiative.meeting_notes}
	<Card>
		<CardHeader>
			<CardTitle>Informação da Reunião</CardTitle>
			<CardDescription>
				Detalhes sobre a proposta e reunião da Assembleia de Freguesia
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Proposal Information -->
				{#if initiative.proposal_number || initiative.proposal_type}
					<div class="space-y-4">
						<h4 class="font-semibold text-sm text-gray-900 uppercase tracking-wide">Proposta</h4>
						{#if initiative.proposal_number}
							<div>
								<span class="text-sm font-medium text-gray-600">Número da Proposta:</span>
								<p class="text-gray-900">{initiative.proposal_number}</p>
							</div>
						{/if}
						{#if initiative.proposal_type}
							<div>
								<span class="text-sm font-medium text-gray-600">Tipo de Proposta:</span>
								<p class="text-gray-900 capitalize">{initiative.proposal_type}</p>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Meeting Information -->
				{#if initiative.meeting_number || initiative.meeting_date || initiative.meeting_type}
					<div class="space-y-4">
						<h4 class="font-semibold text-sm text-gray-900 uppercase tracking-wide">Reunião</h4>
						{#if initiative.meeting_number}
							<div>
								<span class="text-sm font-medium text-gray-600">Número da Reunião:</span>
								<p class="text-gray-900">{initiative.meeting_number}</p>
							</div>
						{/if}
						{#if initiative.meeting_date}
							<div>
								<span class="text-sm font-medium text-gray-600">Data da Reunião:</span>
								<p class="text-gray-900">{formatDate(initiative.meeting_date)}</p>
							</div>
						{/if}
						{#if initiative.meeting_type}
							<div>
								<span class="text-sm font-medium text-gray-600">Tipo de Reunião:</span>
								<p class="text-gray-900 capitalize">{initiative.meeting_type}</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Meeting Notes -->
			{#if initiative.meeting_notes}
				<div class="mt-6 pt-6 border-t">
					<h4 class="font-semibold text-sm text-gray-900 uppercase tracking-wide mb-2">Observações da Reunião</h4>
					<div class="prose prose-gray max-w-none">
						{#each initiative.meeting_notes.split('\n') as paragraph (paragraph)}
							{#if paragraph.trim()}
								<p class="mb-2 text-gray-700">{paragraph}</p>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
{/if}