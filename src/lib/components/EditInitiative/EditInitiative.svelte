<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import branding from '$lib/config/branding';
	import type { Parish, Tag } from '$lib/server/database';
	import type { FullInitiativeResponse } from '../../../routes/api/initiatives/[id]/+server';
	import SelectAutarchy from '../SelectAutarchy.svelte';
	import DocumentManager from './DocumentManager.svelte';
	import InitiativeBasicInfo from './InitiativeBasicInfo.svelte';
	import InitiativeStatusInfo from './InitiativeStatusInfo.svelte';
	import InitiativeActions from './InitiativeSubmitSave.svelte';
	import MeetingInfo from './MeetingInfo.svelte';
	import TagManager from './TagManager.svelte';
	import VoteEditor from './VoteEditor.svelte';

	let { initiative, tags, parishes, defaultParish }:{initiative?: FullInitiativeResponse, tags: Tag[], parishes: Parish[], defaultParish?: string } = $props();

	// Check if we're in edit mode (data.initiative exists)
	const isEditMode = !!initiative?.id;
	const initiativeId = initiative?.id ?? null;

	let selectedParish = $state(defaultParish ?? initiative?.parish_code ?? '');

	let title = $state(initiative?.title ?? '');
	let description = $state(initiative?.description ?? '');
	let content = $state(initiative?.content ?? '');
	let selectedTags: number[] = $state(initiative?.tags ?
		initiative.tags.map(t => t.id) : []);
	let votes = $state(initiative?.votes ? [...initiative.votes] : []);
	let saving = $state(false);
	let error = $state('');
	let selectedFile: File | null = $state(null);
	let fileInput: FileList | undefined = $state(undefined);

	// Meeting fields
	let proposalNumber = $state(initiative?.proposal_number ?? '');
	let proposalType = $state(initiative?.proposal_type ?? '');
	let meetingNumber = $state(initiative?.meeting_number ?? null);
	let meetingDate = $state(initiative?.meeting_date ?? '');
	let meetingType = $state(initiative?.meeting_type ?? '');
	let meetingNotes = $state(initiative?.meeting_notes ?? '');
	let proposalDocument: File | null = $state(null);
	let proposalDocumentInput: FileList | undefined = $state(undefined);

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
				`/api/backoffice/initiatives/${initiativeId}` :
					'/api/backoffice/initiatives';
			const method = isEditMode ? 'PUT' : 'POST';

			// Use FormData for file upload
			const formData = new FormData;
			formData.append('title', title.trim());
			formData.append('description', description.trim());
			formData.append('content', content.trim());
			formData.append('tags', JSON.stringify(selectedTags));
			formData.append('status', status);
			formData.append('votes', JSON.stringify(votes));
			if (selectedFile) formData.append('document', selectedFile);
			if (proposalDocument) formData.append('proposalDocument', proposalDocument);
			// Meeting fields
			formData.append('proposalNumber', proposalNumber || '');
			formData.append('proposalType', proposalType || '');
			formData.append('meetingNumber', meetingNumber?.toString() || '');
			formData.append('meetingDate', meetingDate || '');
			formData.append('meetingType', meetingType || '');
			formData.append('meetingNotes', meetingNotes || '');

			response = await fetch(url, {
				method,
				body: formData,
			});

			const responseData = await response.json();

			if (response.ok) {
				if (isEditMode) {
					// For edit mode, stay on the page and show success
					error = '';
					// Clear the selected file after successful upload
					selectedFile = null;
					if (fileInput) fileInput = undefined;
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
	<title>{initiative?.title ? `Editar: ${initiative.title}` : 'Nova Iniciativa'} - {branding.siteName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Main Content -->
	<main class="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<Card>
				<CardHeader class="flex justify-between items-center">
					<div>
						<CardTitle>{isEditMode ? 'Editar Iniciativa' : 'Criar Nova Iniciativa'}</CardTitle>
						<CardDescription>
							{isEditMode ? 'Edite os campos abaixo para atualizar a sua iniciativa' : 'Preencha os campos abaixo para criar uma nova iniciativa para a sua freguesia'}
						</CardDescription>
					</div>
					<SelectAutarchy {parishes} bind:selectedParish allEnabled={false}/>
				</CardHeader>
				<CardContent class="space-y-6">
					{#if error}
						<div class="p-4 bg-red-50 border border-red-200 rounded-md">
							<p class="text-red-800 text-sm">{error}</p>
						</div>
					{/if}

					<!-- Basic Information -->
					<InitiativeBasicInfo bind:title bind:description bind:content />

					<!-- Tags -->
					<TagManager bind:tags bind:selectedTags bind:error />

					<!-- Meeting Information -->
					<MeetingInfo
						bind:proposalNumber
						bind:proposalType
						bind:meetingNumber
						bind:meetingDate
						bind:meetingType
						bind:meetingNotes
						bind:proposalDocument
						bind:proposalDocumentInput
					/>

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