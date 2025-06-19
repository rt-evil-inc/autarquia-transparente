<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Textarea from '../ui/textarea/textarea.svelte';

	let { title = $bindable(), description = $bindable(), content = $bindable() } = $props();

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