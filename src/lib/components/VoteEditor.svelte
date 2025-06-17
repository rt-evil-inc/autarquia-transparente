<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Vote } from '$lib/server/database';

	let {
		votes = $bindable([]),
		saving = false,
	}: {
		votes: Omit<Vote, 'initiative_id'>[];
		saving?: boolean;
	} = $props();

	// Vote editing state
	let newVote = $state({ voter_name: '', vote: 'favor' as 'favor' | 'against' | 'abstention', notes: '' });
	let editingVoteId: number | null = $state(null);

	const voteOptions = [
		{ value: 'favor', label: 'A Favor' },
		{ value: 'against', label: 'Contra' },
		{ value: 'abstention', label: 'Abstenção' },
	];

	// Derived value for Select trigger content
	const voteTriggerContent = $derived(
		voteOptions.find(v => v.value === newVote.vote)?.label ?? 'Selecione o tipo de voto',
	);

	// Vote management functions
	function addVote() {
		if (!newVote.voter_name.trim()) return;

		const vote = {
			id: Date.now(), // Temporary ID for new votes
			voter_name: newVote.voter_name.trim(),
			vote: newVote.vote,
			notes: newVote.notes.trim() || null,
			created_at: (new Date).toISOString(),
		};

		votes = [...votes, vote];
		newVote = { voter_name: '', vote: 'favor', notes: '' };
	}

	function editVote(voteId: number) {
		const vote = votes.find(v => v.id === voteId);
		if (vote) {
			editingVoteId = voteId;
			newVote = {
				voter_name: vote.voter_name,
				vote: vote.vote,
				notes: vote.notes || '',
			};
		}
	}

	function updateVote() {
		if (!newVote.voter_name.trim() || editingVoteId === null) return;

		votes = votes.map(vote => vote.id === editingVoteId ?
			{ ...vote, voter_name: newVote.voter_name.trim(), vote: newVote.vote, notes: newVote.notes.trim() || null } :
				vote);

		cancelEditVote();
	}

	function cancelEditVote() {
		editingVoteId = null;
		newVote = { voter_name: '', vote: 'favor', notes: '' };
	}

	function deleteVote(voteId: number) {
		votes = votes.filter(v => v.id !== voteId);
	}

	function getVoteLabel(vote: string) {
		switch (vote) {
			case 'favor': return 'A Favor';
			case 'against': return 'Contra';
			case 'abstention': return 'Abstenção';
			default: return vote;
		}
	}

	function getVoteColor(vote: string) {
		switch (vote) {
			case 'favor': return 'bg-green-100 text-green-800';
			case 'against': return 'bg-red-100 text-red-800';
			case 'abstention': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<!-- Votes Section -->
<div class="pt-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">Gestão de Votos</h3>

	<!-- New Vote Form -->
	<div class="p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<div class="md:col-span-2">
				<Label class="text-sm">Nome do Votante</Label>
				<Input
					bind:value={newVote.voter_name}
					placeholder="Nome da pessoa que vota"
				/>
			</div>
			<div>
				<Label class="text-sm">Tipo de Voto</Label>
				<Select.Root type="single" bind:value={newVote.vote}>
					<Select.Trigger class="w-full">
						{voteTriggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Tipo de Voto</Select.Label>
							{#each voteOptions as option (option.value)}
								<Select.Item
									value={option.value}
									label={option.label}
								>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<div class="mt-3">
			<Label class="text-sm">Observações (opcional)</Label>
			<Input
				bind:value={newVote.notes}
				placeholder="Observações sobre o voto"
			/>
		</div>
		<div class="mt-3 flex gap-2">
			{#if editingVoteId !== null}
				<Button
					variant="outline"
					size="sm"
					onclick={updateVote}
					disabled={!newVote.voter_name.trim() || saving}
				>
					Atualizar Voto
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={cancelEditVote}
				>
					Cancelar
				</Button>
			{:else}
				<Button
					variant="outline"
					size="sm"
					onclick={addVote}
					disabled={!newVote.voter_name.trim() || saving}
				>
					Adicionar Voto
				</Button>
			{/if}
		</div>
	</div>

	<!-- Existing Votes -->
	{#if votes.length > 0}
		<div class="bg-white rounded-lg shadow-sm border">
			<div class="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 font-medium text-gray-900 text-sm border-b">
				<div>Votante</div>
				<div>Voto</div>
				<div>Observações</div>
				<div class="text-right">Ações</div>
			</div>
			{#each votes as vote (vote.id)}
				<div class="grid grid-cols-4 gap-4 px-4 py-3 border-b hover:bg-gray-50">
					<div class="font-medium">{vote.voter_name}</div>
					<div>
						<span class="px-2 py-1 rounded-full text-xs font-medium {getVoteColor(vote.vote)}">
							{getVoteLabel(vote.vote)}
						</span>
					</div>
					<div class="text-sm text-gray-600">{vote.notes || 'Sem observações'}</div>
					<div class="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => editVote(vote.id)}
						>
							Editar
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => deleteVote(vote.id)}
							class="text-red-600 hover:text-red-700"
						>
							Remover
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-6 text-gray-500">
			Nenhum voto registado ainda.
		</div>
	{/if}
</div>