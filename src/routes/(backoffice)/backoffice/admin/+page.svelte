<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PageData } from './$types';

	export let data: PageData;

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		} catch (error) {
			console.error('Logout error:', error);
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

	// Use data from load function
	$: stats = data.stats;
	$: recentInitiatives = data.recentInitiatives;
</script>

<svelte:head>
	<title>Admin Dashboard - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between items-center">
				<div class="flex items-center">
					<h1 class="text-xl font-semibold text-gray-900">
						Portal do Autarca - Administração
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-700">
						{data.user?.email}
					</span>
					<Button variant="outline" onclick={logout}>
						Sair
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Navigation -->
	<nav class="bg-blue-600">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex space-x-8">
				<a href="/backoffice/admin" class="border-b-2 border-blue-300 py-4 px-1 text-sm font-medium text-white">
					Dashboard
				</a>
				<a href="/backoffice/admin/initiatives" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-blue-100 hover:border-blue-300 hover:text-white">
					Iniciativas
				</a>
				<a href="/backoffice/admin/parishes" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-blue-100 hover:border-blue-300 hover:text-white">
					Freguesias
				</a>
				<a href="/backoffice/admin/users" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-blue-100 hover:border-blue-300 hover:text-white">
					Utilizadores
				</a>
				<a href="/backoffice/admin/tags" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-blue-100 hover:border-blue-300 hover:text-white">
					Tags
				</a>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
				Dashboard
			</h2>

			<!-- Statistics -->
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
				<Card>
					<CardContent class="p-6">
						<div class="text-2xl font-bold text-gray-900">{stats.totalInitiatives}</div>
						<div class="text-sm text-gray-600">Total de Iniciativas</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="p-6">
						<div class="text-2xl font-bold text-green-600">{stats.approvedInitiatives}</div>
						<div class="text-sm text-gray-600">Aprovadas</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="p-6">
						<div class="text-2xl font-bold text-yellow-600">{stats.pendingInitiatives}</div>
						<div class="text-sm text-gray-600">Pendentes</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="p-6">
						<div class="text-2xl font-bold text-blue-600">{stats.totalParishes}</div>
						<div class="text-sm text-gray-600">Freguesias</div>
					</CardContent>
				</Card>
			</div>

			<!-- Recent Initiatives -->
			<Card>
				<CardHeader>
					<CardTitle>Iniciativas Recentes</CardTitle>
					<CardDescription>
						As 5 iniciativas mais recentes no sistema
					</CardDescription>
				</CardHeader>
				<CardContent>
					{#if recentInitiatives.length === 0}
						<p class="text-gray-500">Nenhuma iniciativa encontrada.</p>
					{:else}
						<div class="space-y-4">								{#each recentInitiatives as initiative (initiative.id)}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex-1">
									<h4 class="font-medium text-gray-900">{initiative.title}</h4>
									<p class="text-sm text-gray-600">{initiative.parish_name}</p>
									<p class="text-xs text-gray-500">Criado em {formatDate(initiative.created_at)}</p>
								</div>
								<div class="flex items-center space-x-2">
									<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)}">
										{initiative.status === 'approved' ? 'Aprovada' :
											initiative.status === 'submitted' ? 'Pendente' :
												initiative.status === 'rejected' ? 'Rejeitada' : 'Rascunho'}
									</span>
									<Button variant="outline" size="sm" onclick={() => goto(`/backoffice/admin/initiatives/${initiative.id}`)}>
										Ver
									</Button>
								</div>
							</div>
						{/each}
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Quick Actions -->
			<div class="mt-8">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Button variant="outline" onclick={() => goto('/backoffice/admin/parishes')} class="h-20">
						<div class="text-center">
							<div class="text-sm font-medium">Gerir Freguesias</div>
							<div class="text-xs text-gray-500">Adicionar ou editar freguesias</div>
						</div>
					</Button>

					<Button variant="outline" onclick={() => goto('/backoffice/admin/users')} class="h-20">
						<div class="text-center">
							<div class="text-sm font-medium">Gerir Utilizadores</div>
							<div class="text-xs text-gray-500">Contas de freguesia e admin</div>
						</div>
					</Button>

				</div>
			</div>
		</div>
	</main>
</div>