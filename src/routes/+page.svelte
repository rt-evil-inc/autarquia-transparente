<script lang="ts">
	import SelectAutarchy from '$lib/components/SelectAutarchy.svelte';

	import { goto } from '$app/navigation';
	import Tag from '$lib/components/Tag.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import branding from '$lib/config/branding.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import InitiativeCard from './InitiativeCard.svelte';

	let { data } = $props();

	let initiatives = $derived(data.initiatives);
	let parishes = $derived(data.parishes);
	let tags = $derived(data.tags);
	let totalCount = $derived(data.totalCount);
	let totalPages = $derived(data.totalPages);
	let currentPage = $derived(data.currentPage);
	let perPage = $derived(data.perPage);

	let searchTerm = $derived(data.filters.searchTerm);
	let selectedParish = $derived(data.filters.selectedParish);
	let selectedTag = $derived(data.filters.selectedTag);

	// Pagination setup for UI
	const isDesktop = new MediaQuery('(min-width: 768px)');
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
	// auto search if selectedParish or selectedTag is set
	$effect(() => {
		performSearch(untrack(() => searchTerm), selectedParish, selectedTag, currentPage);
	});

	function performSearch(searchTerm: string, selectedParish: string, selectedTag: string, page: number = 1) {
		const params = new URLSearchParams;
		if (searchTerm.trim()) params.append('search', searchTerm.trim());
		if (selectedParish) params.append('parish', selectedParish);
		if (selectedTag) params.append('tag', selectedTag);
		if (page > 1) params.append('page', page.toString());

		const newUrl = params.toString() ? `/?${params.toString()}` : '/';
		goto(newUrl);
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		performSearch(searchTerm, selectedParish, selectedTag, 1); // Reset to page 1 on search
	}

	function clearFilters() {
		searchTerm = '';
		selectedParish = '';
		selectedTag = '';
		goto('/');
	}

	function handlePageChange(page: number) {
		performSearch(searchTerm, selectedParish, selectedTag, page);
	}

	function getSelectedTagName(): string {
		return selectedTag || 'Todas as tags';
	}
</script>

<svelte:head>
	<title>{branding.siteName} - {branding.pages.home.title}</title>
	<meta
		name="description"
		content="Iniciativas apresentadas por autarcas em todas as freguesias de Lisboa"
	/>
</svelte:head>

<!-- Main Content -->
<main class="container mx-auto px-4 py-8">
	<!-- Title and Description -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-gray-900 mb-4">
			{branding.pages.home.title}
		</h2>
		<p class="text-gray-600 max-w-2xl mx-auto">
			{branding.pages.home.description}
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
		<form onsubmit={handleSearch} class="mb-4">
			<div class="flex gap-4">
				<div class="flex-1">
					<Input
						bind:value={searchTerm}
						placeholder="Pesquisar iniciativa..."
						class="w-full"
					/>
				</div>
				<Button type="submit">Pesquisar</Button>
			</div>
		</form>

		<!-- Filter Options -->
		<div class="flex gap-4 w-full">
			<div>
				<label
					for="parish-dropdown"
					class="block text-sm font-medium text-gray-700 mb-2"
				>Autarquia</label
				>
				<SelectAutarchy {parishes} bind:selectedParish></SelectAutarchy>
			</div>

			<div>
				<label
					for="tag-dropdown"
					class="block text-sm font-medium text-gray-700 mb-2"
				>Tag</label
				>
				<Select.Root type="single" bind:value={selectedTag}>
					<Select.Trigger
						class={buttonVariants({
							variant: 'outline',
							class: 'justify-between',
						})}
					>
						{getSelectedTagName()}
					</Select.Trigger>
					<Select.Content class="w-64">
						<Select.Item
							value=""
						>
							Todas as tags
						</Select.Item>
						<Select.Separator />
						{#each tags as tag (tag.name)}
							<Select.Item
								value={tag.name}
							>
								<span class="flex items-center gap-2">
									<Tag tag={tag} />
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			{#if searchTerm || selectedParish || selectedTag}
				<div class="mt-4 self-end">
					<Button variant="outline" onclick={clearFilters}
					>Limpar filtros</Button
					>
				</div>
			{/if}
		</div>

	</div>

	<!-- Initiatives Display -->
	{#if initiatives.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-600">Nenhuma iniciativa encontrada.</div>
		</div>
	{:else}
		<!-- Results count -->
		<div class="mb-4 text-sm text-gray-600">
			{((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalCount)} de {totalCount} iniciativas
		</div>

		<!-- Initiatives Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each initiatives as initiative (initiative.id)}
				<InitiativeCard {initiative} />
			{/each}
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
</main>