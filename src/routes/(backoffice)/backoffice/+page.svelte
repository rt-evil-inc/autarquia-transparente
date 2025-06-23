<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { MediaQuery, SvelteSet } from 'svelte/reactivity';
	import branding from '$lib/config/branding.js';

	let { data } = $props();

	// Extract pagination data
	let initiatives = $derived(data.initiatives);
	let totalCount = $derived(data.totalCount);
	let totalPages = $derived(data.totalPages);
	let currentPage = $derived(data.currentPage);
	let perPage = $derived(data.perPage);

	// Selection state
	// svelte-ignore non_reactive_update
	let selectedIds = new SvelteSet<number>;

	// Search state
	let searchTerm = $state('');

	// Dialog state
	let showDeleteDialog = $state(false);

	// Pagination setup for UI
	const isDesktop = new MediaQuery('(min-width: 768px)');
	const siblingCount = $derived(isDesktop.current ? 1 : 0);

	// Derived values
	let filteredInitiatives = $derived((() => {
		if (!searchTerm.trim()) return initiatives;
		return initiatives.filter(initiative => initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) || initiative.description?.toLowerCase().includes(searchTerm.toLowerCase()));
	})());

	let isAllSelected = $derived(filteredInitiatives.length > 0 && filteredInitiatives.every(initiative => selectedIds.has(initiative.id)));
	let isSomeSelected = $derived(filteredInitiatives.some(initiative => selectedIds.has(initiative.id)) && !isAllSelected);

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

	function handlePageChange(page: number) {
		const params = new URLSearchParams;
		if (page > 1) params.append('page', page.toString());
		const newUrl = params.toString() ? `/backoffice?${params.toString()}` : '/backoffice';
		console.log('Navigating to:', newUrl);
		goto(newUrl);
	}

	function handleSelectAll() {
		if (isAllSelected) {
			selectedIds.clear();
		} else {
			filteredInitiatives.forEach(initiative => selectedIds.add(initiative.id));
		}
		selectedIds = selectedIds; // Trigger reactivity
	}

	function handleSelectRow(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = selectedIds; // Trigger reactivity
	}

	async function handleDeleteSelected() {
		if (selectedIds.size === 0) return;

		try {
			const response = await fetch('/api/backoffice/initiatives/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					ids: Array.from(selectedIds),
				}),
			});

			const result = await response.json();

			if (response.ok && result.success) {
				await goto('/backoffice');
				await invalidate('app:initiatives');
				selectedIds.clear();
				showDeleteDialog = false;
			} else {
				alert(`Erro: ${result.error || 'Falha ao eliminar iniciativas'}`);
			}
		} catch (error) {
			console.error('Error deleting initiatives:', error);
			alert('Erro ao eliminar iniciativas');
		}
	}

	function openDeleteDialog() {
		if (selectedIds.size === 0) return;
		showDeleteDialog = true;
	}

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
						<!-- Toolbar -->
						<div class="flex items-center justify-between py-4">
							<div class="flex items-center space-x-2">
								<Input
									placeholder="Pesquisar iniciativas..."
									bind:value={searchTerm}
									class="max-w-sm"
								/>
								{#if selectedIds.size > 0}
									<Button
										variant="destructive"
										size="sm"
										onclick={openDeleteDialog}
									>
										<Trash2Icon class="size-4 mr-2" />
										Eliminar ({selectedIds.size})
									</Button>
								{/if}
							</div>
							<div class="text-sm text-gray-600">
								{((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalCount)} de {totalCount} iniciativas
							</div>
						</div>

						<!-- Data Table -->
						<div class="rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-12">
											<input
												type="checkbox"
												checked={isAllSelected}
												indeterminate={isSomeSelected}
												onchange={handleSelectAll}
												class="rounded border-gray-300"
											/>
										</Table.Head>
										<Table.Head>Título</Table.Head>
										<Table.Head>Estado</Table.Head>
										<Table.Head>Data de Criação</Table.Head>
										<Table.Head class="w-32">Ações</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each filteredInitiatives as initiative (initiative.id)}
										<Table.Row>
											<Table.Cell>
												<input
													type="checkbox"
													checked={selectedIds.has(initiative.id)}
													onchange={() => handleSelectRow(initiative.id)}
													class="rounded border-gray-300"
												/>
											</Table.Cell>
											<Table.Cell>
												<div class="font-medium">{initiative.title}</div>
												{#if initiative.description}
													<div class="text-sm text-gray-500 truncate max-w-md">
														{initiative.description}
													</div>
												{/if}
											</Table.Cell>
											<Table.Cell>
												<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)}">
													{getStatusText(initiative.status)}
												</span>
											</Table.Cell>
											<Table.Cell class="text-sm text-gray-500">
												{formatDate(initiative.created_at)}
											</Table.Cell>
											<Table.Cell>
												<div class="flex items-center space-x-2">
													<Button
														variant="outline"
														size="sm"
														onclick={() => goto(`/backoffice/initiatives/${initiative.id}`)}
													>
														Editar
													</Button>
												</div>
											</Table.Cell>
										</Table.Row>
									{:else}
										<Table.Row>
											<Table.Cell colspan={5} class="h-24 text-center">
												{searchTerm ? 'Nenhuma iniciativa encontrada.' : 'Nenhuma iniciativa disponível.'}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>

						<!-- Pagination -->
						{#if totalPages > 1}
							<div class="mt-8 flex justify-center">
								<Pagination.Root
									count={totalCount}
									{perPage}
									{siblingCount}
									page={currentPage}
								>
									{#snippet children({ pages, currentPage: paginationCurrentPage })}
										<Pagination.Content>
											<Pagination.Item>
												<Pagination.PrevButton
													onclick={() => handlePageChange(Math.max(1, currentPage - 1))}
												>
													<ChevronLeftIcon class="size-4" />
													<span class="hidden sm:block">Anterior</span>
												</Pagination.PrevButton>
											</Pagination.Item>
											{#each pages as page (page.key)}
												{#if page.type === 'ellipsis'}
													<Pagination.Item>
														<Pagination.Ellipsis />
													</Pagination.Item>
												{:else}
													<Pagination.Item>
														<Pagination.Link
															{page}
															isActive={paginationCurrentPage === page.value}
															onclick={() => handlePageChange(page.value)}
														>
															{page.value}
														</Pagination.Link>
													</Pagination.Item>
												{/if}
											{/each}
											<Pagination.Item>
												<Pagination.NextButton
													onclick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
												>
													<span class="hidden sm:block">Próxima</span>
													<ChevronRightIcon class="size-4" />
												</Pagination.NextButton>
											</Pagination.Item>
										</Pagination.Content>
									{/snippet}
								</Pagination.Root>
							</div>
						{/if}
					{/if}
				</CardContent>
			</Card>
		</div>
	</main>

	<!-- Delete Confirmation Dialog -->
	<AlertDialog.Root bind:open={showDeleteDialog}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Tem certeza que deseja eliminar?</AlertDialog.Title>
				<AlertDialog.Description>
					Esta ação não pode ser desfeita. Isto irá eliminar permanentemente {selectedIds.size} iniciativa(s) e remover todos os dados associados.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
				<AlertDialog.Action onclick={handleDeleteSelected}>Eliminar</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>