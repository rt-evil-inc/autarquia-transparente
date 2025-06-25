<script lang="ts">
	import type { Parish } from '$lib/server/database';
	import { invalidateAll } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Select from '$lib/components/ui/select';

	interface Props {
		parishes: Parish[];
	}

	let { parishes = [] }: Props = $props();

	let showAddForm = $state(false);
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');

	// Type options for select
	const typeOptions = [
		{ value: 'parish', label: 'Freguesia' },
		{ value: 'autarchy', label: 'Autarquia' },
	];

	// Form state
	let newParish = $state({
		name: '',
		code: '',
		type: 'parish' as 'parish' | 'autarchy',
		description: '',
	});

	// Derived content for select trigger
	const typeTriggerContent = $derived(
		typeOptions.find(t => t.value === newParish.type)?.label ?? 'Selecionar tipo',
	);

	// Parish to delete (for alert dialog)
	let parishToDelete: Parish | null = $state(null);

	function resetForm() {
		newParish = {
			name: '',
			code: '',
			type: 'parish',
			description: '',
		};
		showAddForm = false;
		error = '';
	}

	function resetMessages() {
		error = '';
		success = '';
	}

	async function handleAddParish(event: Event) {
		event.preventDefault();

		if (!newParish.name.trim() || !newParish.code.trim()) {
			error = 'Nome e código são obrigatórios';
			return;
		}

		isLoading = true;
		resetMessages();

		try {
			const response = await fetch('/api/admin/parishes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newParish),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Falha ao criar freguesia');
			}

			success = 'Freguesia criada com sucesso';
			resetForm();
			await invalidateAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Falha ao criar freguesia';
		} finally {
			isLoading = false;
		}
	}

	async function handleDeleteParish() {
		if (!parishToDelete) return;

		isLoading = true;
		resetMessages();

		try {
			const response = await fetch(`/api/admin/parishes/${parishToDelete.id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Falha ao eliminar freguesia');
			}

			success = 'Freguesia eliminada com sucesso';
			parishToDelete = null;
			await invalidateAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Falha ao eliminar freguesia';
		} finally {
			isLoading = false;
		}
	}
</script>

<Card.Root class="w-full h-full flex flex-col">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Gestão de Freguesias</Card.Title>
			<Card.Action>
				<Button
					variant={showAddForm ? 'outline' : 'default'}
					onclick={() => showAddForm = !showAddForm}
					disabled={isLoading}
				>
					{showAddForm ? 'Cancelar' : 'Adicionar Freguesia'}
				</Button>
			</Card.Action>
		</div>
	</Card.Header>

	<Card.Content class="flex-1 flex flex-col overflow-hidden">
		<!-- Messages -->
		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{/if}

		{#if success}
			<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
				<p class="text-sm text-green-600">{success}</p>
			</div>
		{/if}

		<!-- Add Parish Form -->
		{#if showAddForm}
			<div class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
				<form onsubmit={handleAddParish} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="grid gap-2">
							<Label for="parish-name">Nome *</Label>
							<Input
								id="parish-name"
								type="text"
								bind:value={newParish.name}
								placeholder="Nome da freguesia"
								required
								disabled={isLoading}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="parish-code">Código *</Label>
							<Input
								id="parish-code"
								type="text"
								bind:value={newParish.code}
								placeholder="Código da freguesia"
								required
								disabled={isLoading}
							/>
						</div>
					</div>

					<div class="grid gap-2">
						<Label for="parish-type">Tipo</Label>
						<Select.Root type="single" name="parishType" bind:value={newParish.type}>
							<Select.Trigger class="w-full">
								{typeTriggerContent}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each typeOptions as typeOption (typeOption.value)}
										<Select.Item
											value={typeOption.value}
											label={typeOption.label}
											disabled={isLoading}
										>
											{typeOption.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>

					<div class="grid gap-2">
						<Label for="parish-description">Descrição</Label>
						<Textarea
							id="parish-description"
							bind:value={newParish.description}
							placeholder="Descrição opcional"
							rows={3}
							disabled={isLoading}
						/>
					</div>

					<div class="flex justify-end space-x-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => resetForm()}
							disabled={isLoading}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? 'A criar...' : 'Criar Freguesia'}
						</Button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Parishes List -->
		<div class="flex-1 overflow-y-auto">
			{#if parishes.length === 0}
				<div class="text-center py-8">
					<p class="text-gray-500">Nenhuma freguesia encontrada</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each parishes as parish (parish.id)}
						<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
							<div class="flex-1">
								<div class="flex items-center space-x-3">
									<h4 class="text-sm font-medium text-gray-900">{parish.name}</h4>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{parish.code}
									</span>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {parish.type === 'parish' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}">
										{parish.type}
									</span>
								</div>
								{#if parish.description}
									<p class="text-sm text-gray-600 mt-1">{parish.description}</p>
								{/if}
								<p class="text-xs text-gray-400 mt-1">
									Criado: {new Date(parish.created_at || '').toLocaleDateString()}
								</p>
							</div>

							<AlertDialog.Root>
								<AlertDialog.Trigger
									class={buttonVariants({ variant: 'destructive', size: 'sm' })} disabled={isLoading}>
									Apagar
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Apagar Freguesia</AlertDialog.Title>
										<AlertDialog.Description>
											Tem a certeza de que pretende apagar a freguesia "<strong>{parish.name}</strong>"? Esta ação não pode ser desfeita e pode afetar utilizadores e iniciativas associadas a esta freguesia.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
										<AlertDialog.Action
											onclick={() => {
												parishToDelete = parish;
												handleDeleteParish();
											}}
											disabled={isLoading}
										>
											{isLoading && parishToDelete?.id === parish.id ? 'A eliminar...' : 'Eliminar'}
										</AlertDialog.Action>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>