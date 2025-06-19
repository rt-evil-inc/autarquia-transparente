<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import branding from '$lib/config/branding.js';

	let { data } = $props();

	function formatDate(dateStr: string | Date | null) {
		if (!dateStr) return 'N/A';
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

</script>

<svelte:head>
	<title>Painel da Freguesia - {branding.siteName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="flex justify-between items-center mb-8">
				<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
					Dashboard da Freguesia
				</h2>
				<Button onclick={() => goto('/backoffice/initiatives/new')}>
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
					</div>
				</CardHeader>
				<CardContent>
					{#if initiatives.length === 0}
						<div class="text-center py-8">
							<p class="text-gray-500 mb-4">Ainda não criou nenhuma iniciativa.</p>
							<Button onclick={() => goto('/backoffice/initiatives/new')}>
								Criar Primera Iniciativa
							</Button>
						</div>
					{:else}
						<div class="space-y-4">
							{#each initiatives.slice(0, 5) as initiative (initiative.id)}
								<div class="flex items-center justify-between p-4 border rounded-lg">
									<div class="flex-1">
										<h4 class="font-medium text-gray-900">{initiative.title}</h4>
										<p class="text-xs text-gray-500">Criado em {formatDate(initiative.created_at)}</p>
									</div>
									<div class="flex items-center space-x-2">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)}">
											{getStatusText(initiative.status)}
										</span>
										<Button variant="outline" size="sm" onclick={() => goto(`/backoffice/initiatives/${initiative.id}`)}>
											Editar
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</main>
</div>