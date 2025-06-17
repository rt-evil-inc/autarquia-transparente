<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();

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

	function getStatusText(status: string) {
		switch (status) {
			case 'approved':
				return 'Aprovada';
			case 'submitted':
				return 'Pendente';
			case 'rejected':
				return 'Rejeitada';
			default:
				return 'Rascunho';
		}
	}

	// Use data from load function
	let initiatives = data.initiatives;
	let parishInfo = data.parishInfo;
	let user = data.user;

</script>

<svelte:head>
	<title>Painel da Freguesia - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between items-center">
				<div class="flex items-center">
					<h1 class="text-xl font-semibold text-gray-900">
						Portal do Autarca - {parishInfo?.name || 'Freguesia'}
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-700">
						{user?.email}
					</span>
					<Button variant="outline" onclick={logout}>
						Sair
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Navigation -->
	<nav class="bg-green-600">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex space-x-8">
				<a href="/backoffice/parish" class="border-b-2 border-green-300 py-4 px-1 text-sm font-medium text-white">
					Dashboard
				</a>
				<a href="/backoffice/parish/initiatives" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-green-100 hover:border-green-300 hover:text-white">
					Iniciativas
				</a>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="flex justify-between items-center mb-8">
				<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
					Dashboard da Freguesia
				</h2>
				<Button onclick={() => goto('/backoffice/parish/initiatives/new')}>
					+ Nova Iniciativa
				</Button>
			</div>

			<!-- Recent Initiatives -->
			<Card>
				<CardHeader>
					<div class="flex justify-between items-center">
						<div>
							<CardTitle>Suas Iniciativas</CardTitle>
							<CardDescription>
								Todas as iniciativas criadas por esta freguesia
							</CardDescription>
						</div>
						<Button onclick={() => goto('/backoffice/parish/initiatives')}>
							Ver Todas
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{#if initiatives.length === 0}
						<div class="text-center py-8">
							<p class="text-gray-500 mb-4">Ainda não criou nenhuma iniciativa.</p>
							<Button onclick={() => goto('/backoffice/parish/initiatives/new')}>
								Criar Primera Iniciativa
							</Button>
						</div>
					{:else}
						<div class="space-y-4">
							{#each initiatives.slice(0, 5) as initiative (initiative.id)}
								<div class="flex items-center justify-between p-4 border rounded-lg">
									<div class="flex-1">
										<h4 class="font-medium text-gray-900">{initiative.title}</h4>
										<p class="text-sm text-gray-600">{initiative.category || 'Sem categoria'}</p>
										<p class="text-xs text-gray-500">Criado em {formatDate(initiative.created_at)}</p>
									</div>
									<div class="flex items-center space-x-2">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)}">
											{getStatusText(initiative.status)}
										</span>
										<Button variant="outline" size="sm" onclick={() => goto(`/backoffice/parish/initiatives/${initiative.id}`)}>
											Editar
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
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Button onclick={() => goto('/backoffice/parish/initiatives/new')} class="h-20">
						<div class="text-center">
							<div class="text-sm font-medium">Nova Iniciativa</div>
							<div class="text-xs text-gray-500">Criar nova proposta</div>
						</div>
					</Button>

					<Button variant="outline" onclick={() => goto('/backoffice/parish/initiatives')} class="h-20">
						<div class="text-center">
							<div class="text-sm font-medium">Ver Todas</div>
							<div class="text-xs text-gray-500">Gerir iniciativas existentes</div>
						</div>
					</Button>

					<Button variant="outline" onclick={() => goto('/')} class="h-20">
						<div class="text-center">
							<div class="text-sm font-medium">Portal Público</div>
							<div class="text-xs text-gray-500">Ver site público</div>
						</div>
					</Button>
				</div>
			</div>
		</div>
	</main>
</div>