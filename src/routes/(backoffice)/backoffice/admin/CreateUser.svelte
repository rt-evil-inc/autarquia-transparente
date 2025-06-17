    <script lang="ts">

	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { Parish } from '$lib/server/database';

	let { parishes }: { parishes: Parish[] } = $props();

	let isCreatingUser = $state(false);

	let newUserEmail = $state('');
	let newUserPassword = $state('');
	let newUserRole = $state('parish');
	let newUserParishId = $state('');
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
</script>
<Card>
	<CardHeader>
		<CardTitle>Criar Novo Utilizador</CardTitle>
		<CardDescription>
			Adicionar um novo utilizador ao sistema
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form onsubmit={e => { e.preventDefault(); createUser(); }} class="space-y-4">
			<div class="gap-1.5 flex flex-col">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					bind:value={newUserEmail}
					placeholder="utilizador@example.com"
					required
				/>
			</div>

			<div class="gap-1.5 flex flex-col">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					bind:value={newUserPassword}
					placeholder="••••••••"
					required
				/>
			</div>

			<div class="gap-1.5 flex flex-col">
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
				<div class="gap-1.5 flex flex-col">
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