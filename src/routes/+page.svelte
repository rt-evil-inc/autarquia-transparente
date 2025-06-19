<script lang="ts">
	import SelectAutarchy from '../lib/components/SelectAutarchy.svelte';

	import { goto } from '$app/navigation';
	import Masonry from '$lib/components/Masonry.svelte';
	import Tag from '$lib/components/Tag.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import branding from '$lib/config/branding.js';
	import { calculateVotingResult } from '$lib/voting';
	import { untrack } from 'svelte';

	let { data } = $props();

	let initiatives = $derived(data.initiatives);
	let parishes = $derived(data.parishes);
	let tags = $derived(data.tags);

	let searchTerm = $derived(data.filters.searchTerm);
	let selectedParish = $derived(data.filters.selectedParish);
	let selectedTag = $derived(data.filters.selectedTag);
	// auto search if selectedParish or selectedTag is set
	$effect(() => {
		performSearch(untrack(() => searchTerm), selectedParish, selectedTag);
	});

	function performSearch(searchTerm: string, selectedParish: string, selectedTag: string) {
		const params = new URLSearchParams;
		if (searchTerm.trim()) params.append('search', searchTerm.trim());
		if (selectedParish) params.append('parish', selectedParish);
		if (selectedTag) params.append('tag', selectedTag);

		const newUrl = params.toString() ? `/?${params.toString()}` : '/';
		goto(newUrl);
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		performSearch(searchTerm, selectedParish, selectedTag);
	}

	function clearFilters() {
		searchTerm = '';
		selectedParish = '';
		selectedTag = '';
		goto('/');
	}

	function formatDate(dateStr: string | Date | null) {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('pt-PT');
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
		<!-- Initiatives Grid -->
		<!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> -->
		<Masonry
			gridGap="0.75rem"
			colWidth="minmax(Min(20em, 100%), 1fr)"
		>
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
								{#if initiative.votes && initiative.votes.length > 0}
									{@const votingResult = calculateVotingResult(initiative.votes)}
									<div class="flex items-center gap-2">
										<span>Resultado:</span>
										<span class="px-2 py-1 rounded-full text-xs font-medium {votingResult.className}">
											{votingResult.label}
										</span>
									</div>
								{/if}
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
			<!-- </div> -->
		</Masonry>
	{/if}
</main>

<!-- Footer -->
<footer class="bg-gray-50 border-t mt-16">
	<div class="container mx-auto px-4 py-8 text-center text-gray-600">
		<p>
			&copy; 2025 {branding.siteName}. Plataforma de transparência
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