<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import type { FullInitiativeResponse } from '../../../routes/api/initiatives/[id]/+server';

	let {
		initiative,
		isEditMode,
		saving,
		onSave,
	}: {
		initiative?: FullInitiativeResponse,
		isEditMode: boolean,
		saving: boolean,
		onSave: (status: 'draft' | 'submitted' | 'approved' | 'rejected') => Promise<void>,
	} = $props();
</script>

<!-- Actions -->
<div class="flex justify-between pt-6">
	<Button variant="outline" onclick={() => goto(isEditMode ? '/backoffice' : '/backoffice')}>
		Cancelar
	</Button>

	<div class="flex space-x-2">
		{#if isEditMode}
			<Button
				variant="outline"
				onclick={() => onSave(initiative?.status || 'draft')}
				disabled={saving}
			>
				{saving ? 'A guardar...' : 'Guardar Alterações'}
			</Button>

			{#if initiative?.status === 'draft' || initiative?.status === 'rejected'}
				<Button
					variant="outline"
					onclick={() => onSave('submitted')}
					disabled={saving}
				>
					{saving ? 'A submeter...' : 'Submeter para Aprovação'}
				</Button>

				<Button
					onclick={() => onSave('approved')}
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
				onclick={() => onSave('draft')}
				disabled={saving}
			>
				{saving ? 'A guardar...' : 'Guardar Rascunho'}
			</Button>

			<Button
				variant="outline"
				onclick={() => onSave('submitted')}
				disabled={saving}
			>
				{saving ? 'A submeter...' : 'Submeter para Aprovação'}
			</Button>

			<Button
				onclick={() => onSave('approved')}
				disabled={saving}
				class="bg-green-600 hover:bg-green-700"
			>
				{saving ? 'A publicar...' : 'Publicar Diretamente'}
			</Button>
		{/if}
	</div>
</div>