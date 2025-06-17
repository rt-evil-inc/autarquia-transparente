<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { data } = $props();

	// User management state
	let newUserEmail = $state('');
	let newUserPassword = $state('');
	let newUserRole = $state('parish');
	let newUserParishId = $state('');
	let isCreatingUser = $state(false);

	// Use data from load function
	let recentInitiatives = data.recentInitiatives;
	let users = data.users;
	let parishes = data.parishes;

	async function createUser() {
		if (!newUserEmail || !newUserPassword || !newUserRole) {
			alert('Por favor, preencha todos os campos obrigatórios.');
			return;
		}

		isCreatingUser = true;

		try {
			const response = await fetch('/api/admin/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: newUserEmail,
					password: newUserPassword,
					role: newUserRole,
					parish_id: newUserParishId ? parseInt(newUserParishId) : undefined,
				}),
			});

			if (response.ok) {
				// Reset form
				newUserEmail = '';
				newUserPassword = '';
				newUserRole = 'parish';
				newUserParishId = '';

				// Refresh the page to show the new user
				window.location.reload();
			} else {
				const errorData = await response.json();
				alert(`Erro ao criar utilizador: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error creating user:', error);
			alert('Erro ao criar utilizador. Tente novamente.');
		} finally {
			isCreatingUser = false;
		}
	}

	function formatDate(dateStr: string | Date) {
		return new Date(dateStr).toLocaleDateString('pt-PT');
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'approved':
				return 'bg-green-100 text-green-800';
			case 'submitted':
				return 'bg-yellow-100 text-yellow-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
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
</script>

<svelte:head>
	<title>Admin Dashboard - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
				Dashboard
			</h2>

			<!-- User Management Section -->
			<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
				<!-- Create New User -->
				<Card>
					<CardHeader>
						<CardTitle>Criar Novo Utilizador</CardTitle>
						<CardDescription>
							Adicionar um novo utilizador ao sistema
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onsubmit={e => { e.preventDefault(); createUser(); }} class="space-y-4">
							<div>
								<Label for="email">Email</Label>
								<Input
									id="email"
									type="email"
									bind:value={newUserEmail}
									placeholder="utilizador@example.com"
									required
								/>
							</div>

							<div>
								<Label for="password">Password</Label>
								<Input
									id="password"
									type="password"
									bind:value={newUserPassword}
									placeholder="••••••••"
									required
								/>
							</div>

							<div>
								<Label for="role">Função</Label>
								<select
									id="role"
									bind:value={newUserRole}
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="parish">Freguesia</option>
									<option value="admin">Administrador</option>
								</select>
							</div>

							{#if newUserRole === 'parish'}
								<div>
									<Label for="parish">Freguesia (opcional)</Label>
									<select
										id="parish"
										bind:value={newUserParishId}
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="">Selecionar freguesia...</option>
										{#each parishes as parish (parish.id)}
											<option value={parish.id}>{parish.name}</option>
										{/each}
									</select>
								</div>
							{/if}

							<Button type="submit" class="w-full" disabled={isCreatingUser}>
								{isCreatingUser ? 'A criar...' : 'Criar Utilizador'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<!-- Users List -->
				<Card>
					<CardHeader>
						<CardTitle>Utilizadores Existentes</CardTitle>
						<CardDescription>
							Lista de todos os utilizadores no sistema
						</CardDescription>
					</CardHeader>
					<CardContent>
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
												{#if user.parish_id}
													{@const parish = parishes.find(p => p.id === user.parish_id)}
													{#if parish}
														<span class="text-xs text-gray-500">
															{parish.name}
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
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

		</div>
	</main>
</div>