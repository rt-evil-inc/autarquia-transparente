<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Tag from '$lib/components/Tag.svelte';

	let { data } = $props();

	// Extract data from props
	let initiatives = data.initiatives;
	let parishes = data.parishes;
	let tags = data.tags;

	// Current filter values (bound to form inputs)
	let searchTerm = $state(data.filters.searchTerm);
	let selectedParish = $state(data.filters.selectedParish);
	let selectedCategory = $state(data.filters.selectedCategory);
	let selectedTag = $state(data.filters.selectedTag);

	const categories = [
		'Finanças',
		'Transparência',
		'Mobilidade',
		'Segurança',
		'Habitação',
		'Património',
	];

	function performSearch() {
		const params = new URLSearchParams;
		if (searchTerm.trim()) params.append('search', searchTerm.trim());
		if (selectedParish) params.append('parish', selectedParish);
		if (selectedCategory) params.append('category', selectedCategory);
		if (selectedTag) params.append('tag', selectedTag);

		const newUrl = params.toString() ? `/?${params.toString()}` : '/';
		goto(newUrl);
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		performSearch();
	}

	function clearFilters() {
		searchTerm = '';
		selectedParish = '';
		selectedCategory = '';
		selectedTag = '';
		goto('/');
	}

	function formatDate(dateStr: string | Date | null) {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('pt-PT');
	}

	function getSelectedParishName(): string {
		if (!selectedParish) return 'Todas as freguesias';
		const parish = parishes.find(p => p.code === selectedParish);
		return parish?.name || 'Todas as freguesias';
	}

	function getSelectedCategoryName(): string {
		return selectedCategory || 'Todas as categorias';
	}

	function getSelectedTagName(): string {
		return selectedTag || 'Todas as tags';
	}
</script>

<svelte:head>
	<title>Portal do Autarca - Todas as Iniciativas</title>
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
			Todas as iniciativas
		</h2>
		<p class="text-gray-600 max-w-2xl mx-auto">
			Iniciativas apresentadas por autarcas em todas as freguesias de
			Lisboa
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
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label
					for="parish-dropdown"
					class="block text-sm font-medium text-gray-700 mb-2"
				>Freguesia</label
				>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						id="parish-dropdown"
						class={buttonVariants({
							variant: 'outline',
							class: 'justify-between',
						})}
					>
						{getSelectedParishName()}
						<svg
							class="ml-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Item
							onclick={() => {
								selectedParish = '';
								performSearch();
							}}
						>
							Todas as freguesias
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						{#each parishes as parish (parish.code)}
							<DropdownMenu.Item
								onclick={() => {
									selectedParish = parish.code;
									performSearch();
								}}
							>
								{parish.name}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div>
				<label
					for="category-dropdown"
					class="block text-sm font-medium text-gray-700 mb-2"
				>Categoria</label
				>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button
							id="category-dropdown"
							variant="outline"
							class="w-full justify-between"
						>
							{getSelectedCategoryName()}
							<svg
								class="ml-2 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Item
							onclick={() => {
								selectedCategory = '';
								performSearch();
							}}
						>
							Todas as categorias
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						{#each categories as category (category)}
							<DropdownMenu.Item
								onclick={() => {
									selectedCategory = category;
									performSearch();
								}}
							>
								{category}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div>
				<label
					for="tag-dropdown"
					class="block text-sm font-medium text-gray-700 mb-2"
				>Tag</label
				>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={buttonVariants({
							variant: 'outline',
							class: 'justify-between',
						})}
					>
						{getSelectedTagName()}
						<svg
							class="ml-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Item
							onclick={() => {
								selectedTag = '';
								performSearch();
							}}
						>
							Todas as tags
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						{#each tags as tag (tag.name)}
							<DropdownMenu.Item
								onclick={() => {
									selectedTag = tag.name;
									performSearch();
								}}
							>
								<span class="flex items-center gap-2">
									<Tag tag={tag} />
								</span>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		{#if searchTerm || selectedParish || selectedCategory || selectedTag}
			<div class="mt-4">
				<Button variant="outline" onclick={clearFilters}
				>Limpar filtros</Button
				>
			</div>
		{/if}
	</div>

	<!-- Initiatives Display -->
	{#if initiatives.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-600">Nenhuma iniciativa encontrada.</div>
		</div>
	{:else}
		<!-- Initiatives Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each initiatives as initiative (initiative.id)}
				<a href="/iniciativa/{initiative.id}" class="block group">
					<Card
						class="hover:shadow-lg transition-shadow cursor-pointer"
					>
						<CardHeader>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<CardTitle
										class="text-lg leading-tight mb-2 group-hover:text-blue-600"
									>
										{initiative.title}
									</CardTitle>
									<CardDescription>
										{initiative.parish_name}
									</CardDescription>
								</div>
								{#if initiative.category}
									<span
										class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
									>
										{initiative.category}
									</span>
								{/if}
							</div>
						</CardHeader>

						<CardContent>
							{#if initiative.description}
								<p
									class="text-gray-600 text-sm mb-4 line-clamp-3"
								>
									{initiative.description}
								</p>
							{/if}

							<!-- Tags -->
							{#if initiative.tags && initiative.tags.length > 0}
								<div class="flex flex-wrap gap-1 mb-4">
									{#each initiative.tags as tag (tag.id)}
										<Tag tag={tag} />
									{/each}
								</div>
							{/if}

							<!-- Meta Info -->
							<div class="text-xs text-gray-500 space-y-1">
								{#if initiative.vote_date}
									<div>
										Votação: {formatDate(
											initiative.vote_date,
										)}
									</div>
								{/if}
								<div>
									Criado: {formatDate(initiative.created_at)}
								</div>
							</div>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</main>

<!-- Footer -->
<footer class="bg-gray-50 border-t mt-16">
	<div class="container mx-auto px-4 py-8 text-center text-gray-600">
		<p>
			&copy; 2025 Portal do Autarca. Plataforma de transparência
			municipal.
		</p>
	</div>
</footer>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>