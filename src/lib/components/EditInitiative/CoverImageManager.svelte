<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import Input from '../ui/input/input.svelte';
	import type { FullInitiativeResponse } from '../../../routes/api/initiatives/[id]/+server';

	let {
		initiative,
		isEditMode,
		coverImage = $bindable(),
		coverImageInput = $bindable(),
		error = $bindable(),
	}: {
		initiative?: FullInitiativeResponse,
		isEditMode: boolean,
		coverImage: File | null,
		coverImageInput: FileList | undefined,
		error: string
	} = $props();

	function handleCoverImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];

			// Validate file type
			if (!file.type.startsWith('image/')) {
				error = 'Por favor selecione apenas ficheiros de imagem';
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				error = 'A imagem deve ter no máximo 5MB';
				return;
			}

			coverImage = file;
			error = '';
		}
	}

	function removeCoverImage() {
		coverImage = null;
		if (coverImageInput) coverImageInput = undefined;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<Label class="text-base font-medium text-gray-900">Imagem de Capa</Label>
		<span class="text-sm text-gray-500">Opcional</span>
	</div>

	<!-- Current Cover Image (Edit Mode) -->
	{#if isEditMode && initiative?.cover_image}
		<div class="space-y-2">
			<Label class="block text-sm font-medium text-gray-700">Imagem Atual</Label>
			<div class="relative inline-block">
				<img
					src="/api/uploads/{initiative.cover_image}"
					alt="Imagem de capa atual"
					class="w-48 h-32 object-cover rounded-lg border border-gray-200"
				/>
			</div>
		</div>
	{/if}

	<!-- Cover Image Upload -->
	<div class="space-y-2">
		<Label for="coverImage" class="block text-sm font-medium text-gray-700">
			{isEditMode && initiative?.cover_image ? 'Substituir Imagem' : 'Carregar Imagem de Capa'}
		</Label>
		<Input
			bind:files={coverImageInput}
			type="file"
			id="coverImage"
			accept="image/*"
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			onchange={handleCoverImageChange}
		/>
		<p class="text-xs text-gray-500">
			Aceita imagens PNG, JPG, JPEG. Tamanho máximo: 5MB. Recomendado: 16:9 ou 4:3.
		</p>

		{#if coverImage}
			<div class="flex items-center justify-between mt-2 p-3 bg-green-50 rounded border">
				<div class="flex items-center space-x-3">
					<!-- Preview thumbnail -->
					<div class="w-16 h-12 overflow-hidden rounded border">
						<img
							src={URL.createObjectURL(coverImage)}
							alt="Pré-visualização"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="text-sm text-green-600">
						<div class="font-medium">{coverImage.name}</div>
						<div>({(coverImage.size / 1024 / 1024).toFixed(2)} MB)</div>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					type="button"
					onclick={removeCoverImage}
				>
					Remover
				</Button>
			</div>
		{/if}
	</div>
</div>