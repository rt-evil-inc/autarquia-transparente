<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card/index.js';

	let { data } = $props();
	let autarca = $derived(data.autarca);
	const imgs = import.meta.glob<{default:string}>('../pics/*.{jpg,jpeg,png,webp}',
		{
			eager: true,
			query: {
				enhanced: true,
			},
		});
	const img = imgs['../pics/' + data.autarca.image];
</script>

<svelte:head>
	<title>{autarca.name} - Portal do Autarca</title>
	<meta name="description" content="Perfil completo de {autarca.name}, {autarca.municipality}" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Hero Section -->
	<div class="bg-blue-600 text-white">
		<div class="container mx-auto px-4 py-8">
			<div class="max-w-6xl mx-auto">
				<!-- Breadcrumb -->
				<nav class="mb-6" aria-label="Breadcrumb">
					<ol class="flex items-center space-x-2 text-blue-100">
						<li><a href="/" class="hover:text-blue-50 transition-colors">Início</a></li>
						<li><span class="mx-2 text-blue-200">/</span></li>
						<li><a href="/autarcas" class="hover:text-blue-50 transition-colors">Autarcas</a></li>
						<li><span class="mx-2 text-blue-200">/</span></li>
						<li class="text-blue-50 font-medium">{autarca.name}</li>
					</ol>
				</nav>

				<!-- Main Hero Content -->
				<div class="flex gap-8 items-center">
					<!-- Image -->
					<enhanced:img
						src={img.default}
						alt="{autarca.name}"
						class="max-w-xs rounded-xl shadow-2xl object-cover aspect-square"
						loading="eager"
					/>

					<!-- Content -->
					<div>
						<h1 class="text-3xl lg:text-4xl font-bold mb-2 text-white">{autarca.name}</h1>
						<p class="text-lg text-blue-100 mb-3">{autarca.municipality}</p>
						<span class="inline-block px-3 py-1 bg-blue-700 text-blue-50 border border-blue-500 rounded-full text-sm">
							{autarca.parish}
						</span>
					</div>

				</div>
			</div>
		</div>
	</div>

	<!-- Content Section -->
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-6xl mx-auto">
			<div class="gap-8">
				<!-- Main Content -->
				<div class="lg:col-span-2 space-y-6">
					<!-- About Section -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center text-xl">
								<svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
								</svg>
								Sobre
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p class="text-gray-700 leading-relaxed text-base">
								{autarca.description}
							</p>
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	</div>
</div>