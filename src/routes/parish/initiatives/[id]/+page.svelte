<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TAG_COLORS, getTagClasses, getTagColorByName } from '$lib/colors';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageData } from './$types';

	export let data: PageData;

	// Initialize form state from loaded data
	let initiative = data.initiative;
	let title = initiative.title || '';
	let description = initiative.description || '';
	let content = initiative.content || '';
	let category = initiative.category || '';
	let selectedTags: number[] = initiative.tags ? initiative.tags.map(t => t.id) : [];
	let tags = data.tags;
	let categories = data.categories;

	let saving = false;
	let error = '';
	let newTagName = '';
	let newTagColor = 'blue';
	let showNewTagForm = false;
	let creatingTag = false;

	async function updateInitiative(status?: string) {
		if (!title.trim()) {
			error = 'O título é obrigatório';
			return;
		}

		saving = true;
		error = '';

		try {
			const response = await fetch(`/api/parish/initiatives/${page.params.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					content: content.trim(),
					category: category || null,
					tags: selectedTags,
					status: status || initiative.status,
				}),
			});

			if (response.ok) {
				// Refresh the page to get updated data
				location.reload();
			} else {
				const data = await response.json();
				error = data.error || 'Erro ao atualizar iniciativa';
			}
		} catch {
			error = 'Erro de rede. Tente novamente.';
		} finally {
			saving = false;
		}
	}

	function toggleTag(tagId: number) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter(id => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
	}

	async function createNewTag() {
		if (!newTagName.trim()) {
			return;
		}

		creatingTag = true;

		try {
			const selectedColor = getTagColorByName(newTagColor);

			const response = await fetch('/api/tags', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newTagName.trim(),
					color: selectedColor?.hex || '#3B82F6',
				}),
			});

			const data = await response.json();

			if (response.ok) {
				// Add the new tag to the list and select it
				tags = [...tags, data.tag];
				selectedTags = [...selectedTags, data.tag.id];

				// Reset form
				newTagName = '';
				newTagColor = 'blue';
				showNewTagForm = false;
			} else if (response.status === 409) {
				// Tag already exists, select it if not already selected
				const existingTag = data.tag;
				if (!selectedTags.includes(existingTag.id)) {
					selectedTags = [...selectedTags, existingTag.id];
				}
				newTagName = '';
				showNewTagForm = false;
			} else {
				error = data.error || 'Erro ao criar tag';
			}
		} catch {
			error = 'Erro de rede ao criar tag.';
		} finally {
			creatingTag = false;
		}
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
</script>

<svelte:head>
	<title>Editar Iniciativa - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between items-center">
				<div class="flex items-center space-x-4">
					<Button variant="outline" onclick={() => goto('/parish/initiatives')}>
						← Voltar
					</Button>
					<h1 class="text-xl font-semibold text-gray-900">Editar Iniciativa</h1>
					{#if initiative}
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(initiative.status)}">
							{getStatusText(initiative.status)}
						</span>
					{/if}
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-700">
						{page.data?.user?.email}
					</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			{#if error && !initiative}
				<Card>
					<CardContent class="text-center py-12">
						<p class="text-red-600 mb-4">{error}</p>
						<Button onclick={() => goto('/parish/initiatives')}>
							Voltar às Iniciativas
						</Button>
					</CardContent>
				</Card>
			{:else if initiative}
				<Card>
					<CardHeader>
						<CardTitle>Editar Iniciativa</CardTitle>
						<CardDescription>
							Edite os campos abaixo para atualizar a sua iniciativa
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						{#if error}
							<div class="p-4 bg-red-50 border border-red-200 rounded-md">
								<p class="text-red-800 text-sm">{error}</p>
							</div>
						{/if}

						<!-- Title -->
						<div class="space-y-2">
							<Label for="title">Título *</Label>
							<Input
								id="title"
								bind:value={title}
								placeholder="Título da iniciativa"
								required
							/>
						</div>

						<!-- Description -->
						<div class="space-y-2">
							<Label for="description">Descrição Resumida</Label>
							<textarea
								id="description"
								bind:value={description}
								placeholder="Descrição breve da iniciativa (opcional)"
								class="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							></textarea>
						</div>

						<!-- Content -->
						<div class="space-y-2">
							<Label for="content">Conteúdo Detalhado</Label>
							<textarea
								id="content"
								bind:value={content}
								placeholder="Descrição detalhada da iniciativa, objetivos, justificação..."
								class="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							></textarea>
						</div>

						<!-- Category -->
						<div class="space-y-2">
							<Label for="category">Categoria</Label>
							<select
								id="category"
								bind:value={category}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="">Selecione uma categoria (opcional)</option>
								{#each categories as cat (cat)}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
						</div>

						<!-- Tags -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label>Tags</Label>
								<Button
									variant="outline"
									size="sm"
									type="button"
									onclick={() => showNewTagForm = !showNewTagForm}
								>
									+ Nova Tag
								</Button>
							</div>

							<!-- New Tag Form -->
							{#if showNewTagForm}
								<div class="p-4 border rounded-lg bg-gray-50 space-y-3">
									<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
										<div class="md:col-span-2">
											<Label for="newTagName" class="text-sm">Nome da Tag</Label>
											<Input
												id="newTagName"
												bind:value={newTagName}
												placeholder="Nome da nova tag"
											/>
										</div>
										<div>
											<Label for="newTagColor" class="text-sm">Cor</Label>
											<select
												id="newTagColor"
												bind:value={newTagColor}
												class="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm"
											>
												{#each TAG_COLORS as color (color.name)}
													<option value={color.name}>{color.label}</option>
												{/each}
											</select>
										</div>
									</div>

									<!-- Color Preview -->
									{#if newTagName.trim()}
										<div class="flex items-center space-x-2">
											<span class="text-sm text-gray-600">Pré-visualização:</span>
											<span class="px-3 py-1 rounded-full text-sm {getTagColorByName(newTagColor)?.bg} {getTagColorByName(newTagColor)?.text}">
												{newTagName.trim()}
											</span>
										</div>
									{/if}

									<div class="flex space-x-2">
										<Button
											size="sm"
											onclick={createNewTag}
											disabled={!newTagName.trim() || creatingTag}
										>
											{creatingTag ? 'A criar...' : 'Criar Tag'}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onclick={() => {
												showNewTagForm = false;
												newTagName = '';
												newTagColor = 'blue';
											}}
										>
											Cancelar
										</Button>
									</div>
								</div>
							{/if}

							<!-- Existing Tags -->
							<div class="flex flex-wrap gap-2">
								{#each tags as tag (tag.id)}
									<button
										type="button"
										onclick={() => toggleTag(tag.id)}
										class="px-3 py-1 rounded-full text-sm border transition-all duration-200 {getTagClasses(tag.color)}"
									>
										{tag.name}
									</button>
								{/each}

								{#if tags.length === 0}
									<p class="text-sm text-gray-500">Nenhuma tag disponível. Crie a primeira!</p>
								{/if}
							</div>
						</div>

						<!-- Initiative Status Info -->
						<div class="bg-blue-50 p-4 rounded-lg">
							<h4 class="font-medium text-blue-900 mb-2">Estado da Iniciativa</h4>
							<p class="text-sm text-blue-800">
								{#if initiative.status === 'draft'}
									Esta iniciativa está em rascunho. Pode editá-la e depois submetê-la para aprovação ou publicá-la diretamente.
								{:else if initiative.status === 'submitted'}
									Esta iniciativa foi submetida para aprovação. Pode ainda editá-la enquanto aguarda aprovação.
								{:else if initiative.status === 'approved'}
									Esta iniciativa foi aprovada e está visível publicamente. Alterações serão refletidas imediatamente no site público.
								{:else if initiative.status === 'rejected'}
									Esta iniciativa foi rejeitada. Pode editá-la e voltar a submetê-la.
								{/if}
							</p>
						</div>

						<!-- Actions -->
						<div class="flex justify-between pt-6">
							<Button variant="outline" onclick={() => goto('/parish/initiatives')}>
								Cancelar
							</Button>

							<div class="flex space-x-2">
								<Button
									variant="outline"
									onclick={() => updateInitiative()}
									disabled={saving}
								>
									{saving ? 'A guardar...' : 'Guardar Alterações'}
								</Button>

								{#if initiative.status === 'draft' || initiative.status === 'rejected'}
									<Button
										variant="outline"
										onclick={() => updateInitiative('submitted')}
										disabled={saving}
									>
										{saving ? 'A submeter...' : 'Submeter para Aprovação'}
									</Button>

									<Button
										onclick={() => updateInitiative('approved')}
										disabled={saving}
										class="bg-green-600 hover:bg-green-700"
									>
										{saving ? 'A publicar...' : 'Publicar Diretamente'}
									</Button>
								{/if}

								{#if initiative.status === 'approved'}
									<Button
										onclick={() => goto(`/iniciativa/${initiative.id}`)}
										variant="outline"
									>
										Ver Publicamente
									</Button>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	</main>
</div>