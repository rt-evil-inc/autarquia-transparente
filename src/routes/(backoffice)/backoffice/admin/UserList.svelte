<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { invalidateAll } from '$app/navigation';
	import type { Parish, User } from '$lib/server/database';

	let { users, parishes }: {
		users: User[];
		parishes: Parish[];
	} = $props();

	// Edit state
	let editingUserId: number | null = $state(null);
	let editingParishId: string = $state('null');
	let isLoading = $state(false);
	let error = $state('');

	function formatDate(dateStr: string | Date | null) {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('pt-PT');
	}

	function getRoleBadge(role: string) {
		switch (role) {
			case 'admin':
				return 'bg-blue-100 text-blue-800';
			case 'parish':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function startEditing(user: User) {
		editingUserId = user.id;
		editingParishId = user.parish_id ? user.parish_id.toString() : 'null';
		error = '';
	}

	function cancelEditing() {
		editingUserId = null;
		editingParishId = 'null';
		error = '';
	}

	async function saveParishChange() {
		if (!editingUserId) return;

		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/admin/users/${editingUserId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					parish_id: editingParishId === 'null' ? null : parseInt(editingParishId, 10),
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Falha ao atualizar utilizador');
			}

			cancelEditing();
			await invalidateAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Falha ao atualizar utilizador';
		} finally {
			isLoading = false;
		}
	}

	// Get selected parish name for select trigger
	function getSelectedParishName(): string {
		if (editingParishId === 'null') return 'Nenhuma freguesia';
		const parish = parishes.find(p => p.id.toString() === editingParishId);
		return parish?.name || 'Freguesia não encontrada';
	}

	// Handle Select value change
	function handleSelectChange(value: string) {
		editingParishId = value;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Utilizadores Existentes</CardTitle>
		<CardDescription>
			Lista de todos os utilizadores no sistema
		</CardDescription>
	</CardHeader>
	<CardContent>
		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{/if}

		{#if users.length === 0}
			<p class="text-gray-500">Nenhum utilizador encontrado.</p>
		{:else}
			<div class="space-y-3 h-96 overflow-y-auto">
				{#each users as user (user.id)}
					<div class="flex items-center justify-between p-3 border rounded-lg">
						<div class="flex-1">
							<h4 class="font-medium text-gray-900">{user.email}</h4>
							<div class="flex items-center space-x-2 mt-1">
								<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleBadge(user.role)}">
									{user.role === 'admin' ? 'Administrador' : 'Freguesia'}
								</span>

								{#if editingUserId === user.id}
									<!-- Edit mode: Parish selection -->
									<div class="flex items-center space-x-2">
										<Select.Root
											type="single"
											bind:value={editingParishId}
										>
											<Select.Trigger class="w-48">
												{getSelectedParishName()}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													<Select.Item value="null" label="Nenhuma freguesia">
														Nenhuma freguesia
													</Select.Item>
													{#each parishes as parish (parish.id)}
														<Select.Item
															value={parish.id.toString()}
															label={parish.name}
														>
															{parish.name}
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
								{:else}
									<!-- View mode: Parish display -->
									{#if user.parish_id}
										{@const parish = parishes.find(p => p.id === user.parish_id)}
										{#if parish}
											<span class="text-xs text-gray-500">
												{parish.name}
											</span>
										{/if}
									{:else}
										<span class="text-xs text-gray-400">
											Nenhuma freguesia
										</span>
									{/if}
								{/if}
							</div>
							{#if user.created_at}
								<p class="text-xs text-gray-500 mt-1">
									Criado em {formatDate(user.created_at)}
								</p>
							{/if}
						</div>

						<!-- Action buttons -->
						<div class="flex items-center space-x-2">
							{#if editingUserId === user.id}
								<!-- Edit mode buttons -->
								<Button
									size="sm"
									onclick={saveParishChange}
									disabled={isLoading}
								>
									{isLoading ? 'A guardar...' : 'Guardar'}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onclick={cancelEditing}
									disabled={isLoading}
								>
									Cancelar
								</Button>
							{:else}
								<!-- View mode button -->
								<Button
									size="sm"
									variant="outline"
									onclick={() => startEditing(user)}
									disabled={editingUserId !== null}
								>
									Editar
								</Button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>