<script lang="ts">
	import type { Parish } from '$lib/server/database';
	import { invalidateAll } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	interface Props {
		parishes: Parish[];
	}

	let { parishes = [] }: Props = $props();

	let showAddForm = $state(false);
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');

	// Form state
	let newParish = $state({
		name: '',
		code: '',
		type: 'parish' as 'parish' | 'autarchy',
		description: '',
	});

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
			error = 'Name and code are required';
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
				throw new Error(errorData.error || 'Failed to create parish');
			}

			success = 'Parish created successfully';
			resetForm();
			await invalidateAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create parish';
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
				throw new Error(errorData.error || 'Failed to delete parish');
			}

			success = 'Parish deleted successfully';
			parishToDelete = null;
			await invalidateAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete parish';
		} finally {
			isLoading = false;
		}
	}
</script>

<Card.Root class="w-full h-full flex flex-col">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Parish Management</Card.Title>
			<Card.Action>
				<Button
					variant={showAddForm ? 'outline' : 'default'}
					onclick={() => showAddForm = !showAddForm}
					disabled={isLoading}
				>
					{showAddForm ? 'Cancel' : 'Add Parish'}
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
							<Label for="parish-name">Name *</Label>
							<Input
								id="parish-name"
								type="text"
								bind:value={newParish.name}
								placeholder="Parish name"
								required
								disabled={isLoading}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="parish-code">Code *</Label>
							<Input
								id="parish-code"
								type="text"
								bind:value={newParish.code}
								placeholder="Parish code"
								required
								disabled={isLoading}
							/>
						</div>
					</div>

					<div class="grid gap-2">
						<Label for="parish-type">Type</Label>
						<select
							id="parish-type"
							bind:value={newParish.type}
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							disabled={isLoading}
						>
							<option value="parish">Parish</option>
							<option value="autarchy">Autarchy</option>
						</select>
					</div>

					<div class="grid gap-2">
						<Label for="parish-description">Description</Label>
						<textarea
							id="parish-description"
							bind:value={newParish.description}
							placeholder="Optional description"
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							disabled={isLoading}
						></textarea>
					</div>

					<div class="flex justify-end space-x-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => resetForm()}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? 'Creating...' : 'Create Parish'}
						</Button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Parishes List -->
		<div class="flex-1 overflow-y-auto">
			{#if parishes.length === 0}
				<div class="text-center py-8">
					<p class="text-gray-500">No parishes found</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each parishes as parish (parish.id)}
						<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
									Created: {new Date(parish.created_at || '').toLocaleDateString()}
								</p>
							</div>

							<AlertDialog.Root>
								<AlertDialog.Trigger
									class={buttonVariants({ variant: 'destructive', size: 'sm' })} disabled={isLoading}>
									Delete
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Delete Parish</AlertDialog.Title>
										<AlertDialog.Description>
											Are you sure you want to delete the parish "<strong>{parish.name}</strong>"? This action cannot be undone and may affect users and initiatives associated with this parish.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action
											onclick={() => {
												parishToDelete = parish;
												handleDeleteParish();
											}}
											disabled={isLoading}
										>
											{isLoading && parishToDelete?.id === parish.id ? 'Deleting...' : 'Delete'}
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