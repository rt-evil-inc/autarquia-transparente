<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { FullInitiativeResponse } from '../../routes/api/initiatives/[id]/+server';

	let {
		initiative,
		isEditMode,
		selectedFile = $bindable(),
		fileInput = $bindable(),
		error = $bindable(),
	}: {
		initiative?: FullInitiativeResponse,
		isEditMode: boolean,
		selectedFile: File | null,
		fileInput: HTMLInputElement | null,
		error: string
	} = $props();

	async function deleteDocument(documentId: number) {
		if (!confirm('Tem certeza que deseja remover este documento?')) {
			return;
		}

		try {
			const response = await fetch(`/api/backoffice/parish/initiatives/${initiative?.id}/documents/${documentId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				// Remove the document from the data
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