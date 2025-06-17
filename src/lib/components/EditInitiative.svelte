<script lang="ts">
	import type { Tag } from '$lib/server/database';
	import type { FullInitiativeResponse } from '../../routes/api/initiatives/[id]/+server';
	import VoteEditor from './VoteEditor.svelte';
	import InitiativeBasicInfo from './InitiativeBasicInfo.svelte';
	import TagManager from './TagManager.svelte';
	import DocumentManager from './DocumentManager.svelte';
	import InitiativeStatusInfo from './InitiativeStatusInfo.svelte';
	import InitiativeActions from './InitiativeActions.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';

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
					window.location.href = `/backoffice/initiatives/${responseData.id}`;
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

					<!-- Basic Information -->
					<InitiativeBasicInfo bind:title bind:description bind:content bind:category />

					<!-- Tags -->
					<TagManager bind:tags bind:selectedTags bind:error />

					<!-- Initiative Status Info (Edit Mode) -->
					{#if isEditMode && initiative}
						<InitiativeStatusInfo {initiative} />
					{/if}

					<!-- Document Management -->
					<DocumentManager {initiative} {isEditMode} bind:selectedFile bind:fileInput bind:error />

					<!-- Votes Section (Edit Mode) -->
					<VoteEditor bind:votes={votes} {saving} />

					<!-- Actions -->
					<InitiativeActions
						{initiative}
						{isEditMode}
						{saving}
						onSave={saveInitiative}
					/>
				</CardContent>
			</Card>
		</div>
	</main>
</div>