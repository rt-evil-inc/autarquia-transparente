<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Textarea from '../ui/textarea/textarea.svelte';

	let { title = $bindable(), description = $bindable(), content = $bindable(), category = $bindable() } = $props();

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

	// Get category label for display
	const selectedCategoryLabel = $derived(
		categories.find(c => c.value === category)?.label || null,
	);
</script>

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
	<Textarea
		id="description"
		bind:value={description}
		placeholder="Descrição breve da iniciativa (opcional)"
		class="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
	/>
</div>

<!-- Content -->
<div class="space-y-2">
	<Label for="content">Conteúdo Detalhado</Label>
	<Textarea
		id="content"
		bind:value={content}
		placeholder="Descrição detalhada da iniciativa, objetivos, justificação..."
		class="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
	/>
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