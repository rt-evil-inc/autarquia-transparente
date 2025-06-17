<script lang="ts">
	import type { FullInitiativeResponse } from '../../routes/api/initiatives/[id]/+server';

	let { initiative }: { initiative: FullInitiativeResponse } = $props();
</script>

<!-- Initiative Status Info (Edit Mode) -->
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