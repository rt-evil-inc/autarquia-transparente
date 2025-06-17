<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import type { Parish, User } from '$lib/server/database';

	let { users, parishes }: {
		users: User[];
		parishes: Parish[];
	} = $props();

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
</script>

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