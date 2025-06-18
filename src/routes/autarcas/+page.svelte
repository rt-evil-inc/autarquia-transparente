<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card/index.js';

	let { data } = $props();
	let autarcas = $derived(data.autarcas);

	const imgs = import.meta.glob<{default:string}>('./pics/*.{jpg,jpeg,png,webp}',
		{
			eager: true,
			query: {
				enhanced: true,
			},
		});
</script>

<svelte:head>
	<title>Os nossos autarcas - Portal do Autarca</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Page Header -->
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Os autarcas</h1>
		<p class="text-lg text-gray-600 max-w-2xl mx-auto">
			Conheça os representantes eleitos que trabalham diariamente para melhorar a vida nas suas comunidades locais.
		</p>
	</div>

	<!-- Autarcas Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each autarcas as autarca (autarca.id)}
			<Card class="group transition-all duration-300 cursor-pointer overflow-hidden pt-0">
				<a href="/autarcas/{autarca.id}">
					<!-- Image Container -->
					<div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
						<enhanced:img
							src={imgs['./pics/' + autarca.image].default}
							alt="{autarca.name}"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							loading="lazy"
						/>
					</div>

					<!-- Content -->
					<CardHeader class="pb-2 pt-4">
						<CardTitle class="group-hover:text-blue-600 transition-colors">
							{autarca.name}
						</CardTitle>
						<CardDescription>
							{autarca.municipality}
						</CardDescription>
					</CardHeader>

					<CardContent class="pt-0">
						<p class="text-sm text-gray-600 line-clamp-3">
							{autarca.description}
						</p>
					</CardContent>
				</a>
			</Card>
		{/each}
	</div>

	<!-- Empty State (if no autarcas) -->
	{#if autarcas.length === 0}
		<div class="text-center py-12">
			<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
				<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum autarca encontrado</h3>
			<p class="text-gray-500">
				Não foram encontrados autarcas para apresentar.
			</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>