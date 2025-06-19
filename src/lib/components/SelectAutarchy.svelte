<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import type { Parish } from '$lib/server/database';

	let { parishes, selectedParish = $bindable(), allEnabled = true }:{ parishes:Parish[], selectedParish: string, allEnabled?:boolean } = $props();

	// auto search if selectedParish or selectedTag is set

	function getSelectedParishName(): string {
		if (!selectedParish) return 'Todas as autarquias';
		const parish = parishes.find(p => p.code === selectedParish);
		return parish?.name || 'Todas as autarquias';
	}

</script>

<Select.Root type="single" bind:value={selectedParish}>
	<Select.Trigger
		id="parish-dropdown"
		class={buttonVariants({
			variant: 'outline',
			class: 'justify-between',
		})}
	>
		{getSelectedParishName()}
	</Select.Trigger>
	<Select.Content class="w-56">
		{#if allEnabled}
			<Select.Item
				value=""
			>
				{#if allEnabled}
					Todas as autarquias
				{:else}
					Selecione uma autarquia
				{/if}
			</Select.Item>
			<Select.Separator />
		{/if}
		<Select.Label>Câmara</Select.Label>
		{#each parishes.filter(p => p.type === 'autarchy') as parish (parish.code)}
			<Select.Item
				value={parish.code}
			>
				{parish.name}
			</Select.Item>
		{/each}
		<Select.Separator />
		<Select.Label>Freguesia</Select.Label>
		{#each parishes.filter(p => p.type === 'parish') as parish (parish.code)}
			<Select.Item
				value={parish.code}
			>
				{parish.name}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>