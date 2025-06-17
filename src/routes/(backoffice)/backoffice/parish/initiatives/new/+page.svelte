<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { TAG_COLORS, getTagClasses, getTagColorByName, getTagColorByHex, getDefaultTagColor } from '$lib/colors';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let title = $state('');
	let description = $state('');
	let content = $state('');
	let category = $state('');
	let selectedTags: number[] = $state([]);
	let tags: any[] = $state([]);
	let loading = $state(false);
	let saving = $state(false);
	let error = $state('');
	let newTagName = $state('');
	let newTagColor = $state('blue');
	let showNewTagForm = $state(false);
	let creatingTag = $state(false);
	let selectedFile: File | null = $state(null);
	let fileInput: HTMLInputElement;

	const categories = [
		'Finanças',
		'Transparência',
		'Mobilidade',
		'Segurança',
		'Habitação',
		'Património',
		'Ambiente',
		'Educação',
		'Saúde',
		'Cultura',
	];

	async function loadTags() {
		try {
			const response = await fetch('/api/tags');
			if (response.ok) {
				tags = await response.json();
			}
		} catch (error) {
			console.error('Error loading tags:', error);
		} finally {
			loading = false;
		}
	}

	async function saveInitiative(status: 'draft' | 'submitted' | 'approved') {
		if (!title.trim()) {
			error = 'O título é obrigatório';
			return;
		}

		saving = true;
		error = '';

		try {
			let response;

			if (selectedFile) {
				// Use FormData for file upload
				const formData = new FormData;
				formData.append('title', title.trim());
				formData.append('description', description.trim());
				formData.append('content', content.trim());
				formData.append('category', category || '');
				formData.append('tags', JSON.stringify(selectedTags));
				formData.append('status', status);
				formData.append('document', selectedFile);

				response = await fetch('/api/backoffice/parish/initiatives', {
					method: 'POST',
					body: formData,
				});
			} else {
				// Use JSON for no file upload
				response = await fetch('/api/backoffice/parish/initiatives', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						title: title.trim(),
						description: description.trim(),
						content: content.trim(),
						category: category || null,
						tags: selectedTags,
						status,
					}),
				});
			}

			const data = await response.json();

			if (response.ok) {
				goto(`/backoffice/parish/initiatives/${data.id}`);
			} else {
				error = data.error || 'Erro ao guardar iniciativa';
			}
		} catch (err) {
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
		} catch (err) {
			error = 'Erro de rede ao criar tag';
		} finally {
			creatingTag = false;
		}
	}

	onMount(() => {
		// Check if user is parish
		if (!data?.user || data.user.role !== 'parish') {
			goto('/login');
			return;
		}
		loadTags();
	});
</script>

<svelte:head>
	<title>Nova Iniciativa - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Main Content -->
	<main class="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			{#if loading}
				<div class="text-center py-12">
					<div class="text-gray-600">A carregar...</div>
				</div>
			{:else}
				<Card>
					<CardHeader>
						<CardTitle>Criar Nova Iniciativa</CardTitle>
						<CardDescription>
							Preencha os campos abaixo para criar uma nova iniciativa para a sua freguesia
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
								class="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							></textarea>
						</div>

						<!-- Content -->
						<div class="space-y-2">
							<Label for="content">Conteúdo Detalhado</Label>
							<textarea
								id="content"
								bind:value={content}
								placeholder="Descrição detalhada da iniciativa, objetivos, justificação..."
								class="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							></textarea>
						</div>

						<!-- Category -->
						<div class="space-y-2">
							<Label for="category">Categoria</Label>
							<select
								id="category"
								bind:value={category}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
											<span class="px-3 py-1 rounded-full text-sm border {getTagColorByName(newTagColor)?.bg} {getTagColorByName(newTagColor)?.text} {getTagColorByName(newTagColor)?.border}">
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
										class="px-3 py-1 rounded-full text-sm border transition-all duration-200 {getTagClasses(tag.color)} {selectedTags.includes(tag.id) ? 'ring-2 ring-blue-500 bg-blue-100' : ''}"
									>
										{tag.name}
									</button>
								{/each}

								{#if tags.length === 0}
									<p class="text-sm text-gray-500">Nenhuma tag disponível. Crie a primeira!</p>
								{/if}
							</div>
						</div>

						<!-- Document Upload -->
						<div class="space-y-2">
							<Label for="document">Documento </Label>
							<div class="space-y-2">
								<input
									bind:this={fileInput}
									type="file"
									id="document"
									accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									onchange="{e => {
										const target = e.target as HTMLInputElement;
										selectedFile = target.files?.[0] || null;
									}}"
								/>
								<p class="text-sm text-gray-500">
									Formatos aceites: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG (máx. 10MB)
								</p>
								{#if selectedFile}
									<div class="flex items-center space-x-2 text-sm text-green-600">
										<span>📄</span>
										<span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
										<Button
											variant="outline"
											size="sm"
											type="button"
											onclick={() => {
												selectedFile = null;
												if (fileInput) fileInput.value = '';
											}}
										>
											Remover
										</Button>
									</div>
								{/if}
							</div>
						</div>

						<!-- Actions -->
						<div class="flex justify-between pt-6">
							<Button variant="outline" onclick={() => goto('/backoffice/parish')}>
								Cancelar
							</Button>

							<div class="flex space-x-2">
								<Button
									variant="outline"
									onclick={() => saveInitiative('draft')}
									disabled={saving}
								>
									{saving ? 'A guardar...' : 'Guardar Rascunho'}
								</Button>

								<Button
									variant="outline"
									onclick={() => saveInitiative('submitted')}
									disabled={saving}
								>
									{saving ? 'A submeter...' : 'Submeter para Aprovação'}
								</Button>

								<Button
									onclick={() => saveInitiative('approved')}
									disabled={saving}
									class="bg-green-600 hover:bg-green-700"
								>
									{saving ? 'A publicar...' : 'Publicar Diretamente'}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	</main>
</div>