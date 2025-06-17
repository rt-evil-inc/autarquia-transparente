<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getTagClasses } from '$lib/colors';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchTerm = $state('');
	let statusFilter = $state('');
	let categoryFilter = $state('');

	// Initialize filtered initiatives with loaded data
	let initiatives = data.initiatives;
	let filteredInitiatives = $derived(initiatives.filter(initiative => {
		const matchesSearch = !searchTerm ||
			initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			initiative.description?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = !statusFilter || initiative.status === statusFilter;
		const matchesCategory = !categoryFilter || initiative.category === categoryFilter;

		return matchesSearch && matchesStatus && matchesCategory;
	}));

	function formatDate(dateStr: string|Date) {
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

	let categories = $derived(initiatives.map(i => i.category).filter(Boolean));
</script>

<svelte:head>
	<title>Minhas Iniciativas - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between items-center">
				<div class="flex items-center space-x-4">
					<Button variant="outline" onclick={() => goto('/backoffice/parish')}>
						← Dashboard
					</Button>
					<h1 class="text-xl font-semibold text-gray-900">Minhas Iniciativas</h1>
				</div>
				<div class="flex items-center space-x-4">
					<Button onclick={() => goto('/backoffice/parish/initiatives/new')}>
						+ Nova Iniciativa
					</Button>
					<span class="text-sm text-gray-700">
						{data.user?.email}
					</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<!-- Filters -->
			<Card class="mb-6">
				<CardContent class="pt-6">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Pesquisar</label>
							<Input
								bind:value={searchTerm}
								placeholder="Pesquisar por título ou descrição..."
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
							<select
								bind:value={statusFilter}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="">Todos os estados</option>
								<option value="draft">Rascunhos</option>
								<option value="submitted">Pendentes</option>
								<option value="approved">Aprovadas</option>
								<option value="rejected">Rejeitadas</option>
							</select>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
							<select
								bind:value={categoryFilter}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="">Todas as categorias</option>
								{#each categories as category (category)}
									<option value={category}>{category}</option>
								{/each}
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Results Info -->
			<div class="mb-4">
				<p class="text-sm text-gray-600">
					{filteredInitiatives.length} de {initiatives.length} iniciativas
				</p>
			</div>

			<!-- Initiatives List -->
			{#if filteredInitiatives.length === 0}
				<Card>
					<CardContent class="text-center py-12">
						{#if initiatives.length === 0}
							<p class="text-gray-500 mb-4">Ainda não criou nenhuma iniciativa.</p>
							<Button onclick={() => goto('/backoffice/parish/initiatives/new')}>
								Criar Primera Iniciativa
							</Button>
						{:else}
							<p class="text-gray-500">Nenhuma iniciativa encontrada com os filtros aplicados.</p>
						{/if}
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					{#each filteredInitiatives as initiative (initiative.id)}
						<Card class="hover:shadow-lg transition-shadow">
							<CardContent class="pt-6">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-start justify-between mb-2">
											<h3 class="text-lg font-medium text-gray-900">{initiative.title}</h3>
											<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)} ml-4">
												{getStatusText(initiative.status)}
											</span>
										</div>

										{#if initiative.description}
											<p class="text-gray-600 text-sm mb-3">{initiative.description}</p>
										{/if}

										<div class="flex items-center space-x-4 text-xs text-gray-500">
											{#if initiative.category}
												<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
													{initiative.category}
												</span>
											{/if}
											<span>Criado: {formatDate(initiative.created_at)}</span>
											{#if initiative.submission_date}
												<span>Submetido: {formatDate(initiative.submission_date)}</span>
											{/if}
										</div>

										{#if initiative.tags && initiative.tags.length > 0}
											<div class="flex flex-wrap gap-1 mt-2">
												{#each initiative.tags as tag (tag.id)}
													<span
														class="text-xs px-2 py-1 rounded-full {getTagClasses(tag.name)}"
													>
														{tag.name}
													</span>
												{/each}
											</div>
										{/if}
									</div>

									<div class="flex flex-col space-y-2 ml-4">
										<Button
											variant="outline"
											size="sm"
											onclick={() => goto(`/backoffice/parish/initiatives/${initiative.id}`)}
										>
											Editar
										</Button>

										{#if initiative.status === 'approved'}
											<Button
												variant="outline"
												size="sm"
												onclick={() => goto(`/iniciativa/${initiative.id}`)}
											>
												Ver Público
											</Button>
										{/if}
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>