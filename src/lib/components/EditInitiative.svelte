<script lang="ts">
	import { goto } from '$app/navigation';
	import { TAG_COLORS, getTagClasses, getTagColorByName } from '$lib/colors';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Tag } from '$lib/server/database';
	import type { FullInitiativeResponse } from '../../routes/api/initiatives/[id]/+server';
	import VoteEditor from './VoteEditor.svelte';

	let { initiative, tags }:{initiative?: FullInitiativeResponse, tags: Tag[] } = $props();

	// Check if we're in edit mode (data.initiative exists)
	const isEditMode = !!initiative?.id;
	const initiativeId = initiative?.id ?? null;

	let title = $state(initiative?.title ?? '');
	let description = $state(initiative?.description ?? '');
	let content = $state(initiative?.content ?? '');
	let category = $state(initiative?.category ?? '');
	let selectedTags: number[] = $state(initiative?.tags ?
		initiative.tags.map(t => t.id) : []);
	let votes = $state(initiative?.votes ? [...initiative.votes] : []);
	let saving = $state(false);
	let error = $state('');
	let newTagName = $state('');
	let newTagColor = $state('blue');
	let showNewTagForm = $state(false);
	let creatingTag = $state(false);
	let selectedFile: File | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);

	const categories = [
		{ value: 'financas', label: 'Finanças' },
		{ value: 'transparencia', label: 'Transparência' },
		{ value: 'mobilidade', label: 'Mobilidade' },
		{ value: 'seguranca', label: 'Segurança' },
		{ value: 'habitacao', label: 'Habitação' },
		{ value: 'patrimonio', label: 'Património' },
		{ value: 'ambiente', label: 'Ambiente' },
		{ value: 'educacao', label: 'Educação' },
		{ value: 'saude', label: 'Saúde' },
		{ value: 'cultura', label: 'Cultura' },
	];

	const voteOptions = [
		{ value: 'favor', label: 'A Favor' },
		{ value: 'against', label: 'Contra' },
		{ value: 'abstention', label: 'Abstenção' },
	];

	// Derived values for Select components
	const categoryTriggerContent = $derived(
		categories.find(c => c.value === category)?.label ?? 'Selecione uma categoria',
	);

	// Get category label for saving
	const selectedCategoryLabel = $derived(
		categories.find(c => c.value === category)?.label || null,
	);

	async function saveInitiative(status: 'draft' | 'submitted' | 'approved' | 'rejected') {
		if (!title.trim()) {
			error = 'O título é obrigatório';
			return;
		}

		saving = true;
		error = '';

		try {
			let response;
			const url = isEditMode ?
				`/api/backoffice/parish/initiatives/${initiativeId}` :
					'/api/backoffice/parish/initiatives';
			const method = isEditMode ? 'PUT' : 'POST';

			if (selectedFile) {
				// Use FormData for file upload
				const formData = new FormData;
				formData.append('title', title.trim());
				formData.append('description', description.trim());
				formData.append('content', content.trim());
				formData.append('category', selectedCategoryLabel || '');
				formData.append('tags', JSON.stringify(selectedTags));
				formData.append('status', status);
				formData.append('votes', JSON.stringify(votes));
				formData.append('document', selectedFile);

				response = await fetch(url, {
					method,
					body: formData,
				});
			} else {
				// Use JSON for no file upload
				response = await fetch(url, {
					method,
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						title: title.trim(),
						description: description.trim(),
						content: content.trim(),
						category: selectedCategoryLabel || null,
						tags: selectedTags,
						status,
						votes: votes,
					}),
				});
			}

			const responseData = await response.json();

			if (response.ok) {
				if (isEditMode) {
					// For edit mode, stay on the page and show success
					error = '';
					// Clear the selected file after successful upload
					selectedFile = null;
					if (fileInput) fileInput.value = '';
				} else {
					// For create mode, redirect to the new initiative
					goto(`/backoffice/initiatives/${responseData.id}`);
				}
			} else {
				error = responseData.error || (isEditMode ? 'Erro ao atualizar iniciativa' : 'Erro ao guardar iniciativa');
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
			error = 'Erro de rede ao criar tag';
		} finally {
			creatingTag = false;
		}
	}

	async function deleteDocument(documentId: number) {
		if (!confirm('Tem certeza que deseja remover este documento?')) {
			return;
		}

		try {
			const response = await fetch(`/api/backoffice/parish/initiatives/${initiativeId}/documents/${documentId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				// Remove the document from the data (assuming it gets refreshed or we manage state)
				if (initiative?.documents) {
					initiative.documents = initiative.documents.filter(doc => doc.id !== documentId);
				}
			} else {
				const responseData = await response.json();
				error = responseData.error || 'Erro ao remover documento';
			}
		} catch {
			error = 'Erro de rede ao remover documento';
		}
	}
</script>

<svelte:head>
	<title>{initiative?.title ? `Editar: ${initiative.title}` : 'Nova Iniciativa'} - Portal do Autarca</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Main Content -->
	<main class="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<Card>
				<CardHeader>
					<CardTitle>{isEditMode ? 'Editar Iniciativa' : 'Criar Nova Iniciativa'}</CardTitle>
					<CardDescription>
						{isEditMode ? 'Edite os campos abaixo para atualizar a sua iniciativa' : 'Preencha os campos abaixo para criar uma nova iniciativa para a sua freguesia'}
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
						<Select.Root type="single" name="category" bind:value={category}>
							<Select.Trigger class="w-full">
								{selectedCategoryLabel || 'Selecione uma categoria (opcional)'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Categorias</Select.Label>
									<Select.Item value="" label="Nenhuma categoria">
										Nenhuma categoria
									</Select.Item>
									{#each categories as cat (cat.value)}
										<Select.Item value={cat.value} label={cat.label}>
											{cat.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
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
										<Select.Root type="single" name="newTagColor" bind:value={newTagColor}>
											<Select.Trigger class="w-full">
												<div class="flex items-center gap-2">
													<div class="w-4 h-4 rounded" style="background-color: {getTagColorByName(newTagColor)?.hex || '#3B82F6'}"></div>
													{getTagColorByName(newTagColor)?.label || 'Selecione uma cor'}
												</div>
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													<Select.Label>Cores</Select.Label>
													{#each TAG_COLORS as color (color.name)}
														<Select.Item
															value={color.name}
															label={color.label}
														>
															<div class="flex items-center gap-2">
																<div class="w-4 h-4 rounded" style="background-color: {color.hex}"></div>
																{color.label}
															</div>
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
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

					<!-- Initiative Status Info (Edit Mode) -->
					{#if isEditMode && initiative}
						<div class="bg-blue-50 p-4 rounded-lg">
							<h4 class="font-medium text-blue-900 mb-2">Estado da Iniciativa</h4>
							<p class="text-sm text-blue-800">
								{#if initiative.status === 'draft'}
									Esta iniciativa está em rascunho. Pode editá-la e depois submetê-la para aprovação ou publicá-la diretamente.
								{:else if initiative.status === 'approved'}
									Esta iniciativa foi aprovada e está visível publicamente. Alterações serão refletidas imediatamente no site público.
								{:else if initiative.status === 'rejected'}
									Esta iniciativa foi rejeitada. Pode editá-la e voltar a submetê-la.
								{/if}
							</p>
						</div>
					{/if}

					<!-- Current Documents (Edit Mode) -->
					{#if isEditMode && initiative?.documents && initiative.documents.length > 0}
						<div class="space-y-2">
							<Label class="block text-sm font-medium text-gray-700">Documentos Existentes</Label>
							<div class="space-y-2">
								{#each initiative.documents as document (document.id)}
									<div class="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
										<div class="flex items-center space-x-3">
											<span class="text-blue-600">📄</span>
											<div>
												<p class="text-sm font-medium text-gray-900">{document.original_filename}</p>
												<p class="text-xs text-gray-500">
													{(document.file_size / 1024 / 1024).toFixed(2)} MB •
													Carregado em {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString('pt-PT') : 'Data desconhecida'}
												</p>
											</div>
										</div>
										<div class="flex items-center space-x-2">
											<Button
												variant="outline"
												size="sm"
												onclick={() => window.open(`/uploads/${document.filename}`, '_blank')}
											>
												Ver
											</Button>
											<Button
												variant="outline"
												size="sm"
												onclick={() => deleteDocument(document.id)}
												class="text-red-600 hover:text-red-700"
											>
												Remover
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Document Upload -->
					<div class="space-y-2">
						<Label for="document">{isEditMode ? 'Adicionar Documento Oficial' : 'Documento'}</Label>
						<div class="space-y-2">
							<input
								bind:this={fileInput}
								type="file"
								id="document"
								accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								onchange={e => {
									const target = e.target as HTMLInputElement;
									selectedFile = target.files?.[0] || null;
								}}
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

					<!-- Votes Section (Edit Mode) -->
					<VoteEditor bind:votes={votes} {saving} />

					<!-- Actions -->
					<div class="flex justify-between pt-6">
						<Button variant="outline" onclick={() => goto(isEditMode ? '/backoffice/initiatives' : '/backoffice/parish')}>
							Cancelar
						</Button>

						<div class="flex space-x-2">
							{#if isEditMode}
								<Button
									variant="outline"
									onclick={() => saveInitiative(initiative?.status || 'draft')}
									disabled={saving}
								>
									{saving ? 'A guardar...' : 'Guardar Alterações'}
								</Button>

								{#if initiative?.status === 'draft' || initiative?.status === 'rejected'}
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
								{/if}

								{#if initiative?.status === 'approved'}
									<Button
										onclick={() => goto(`/iniciativa/${initiative?.id}`)}
										variant="outline"
									>
										Ver Publicamente
									</Button>
								{/if}
							{:else}
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
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</main>
</div>