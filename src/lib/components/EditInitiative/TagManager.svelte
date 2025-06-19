<script lang="ts">
	import { TAG_COLORS, getNeutralTagClasses, getSelectedTagClasses, getTagColorByName } from '$lib/colors';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { Tag } from '$lib/server/database';

	let { tags = $bindable(), selectedTags = $bindable(), error = $bindable() }: {
		tags: Tag[],
		selectedTags: number[],
		error: string
	} = $props();

	let newTagName = $state('');
	let newTagColor = $state('blue');
	let showNewTagForm = $state(false);
	let creatingTag = $state(false);

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

			const data: {success:boolean, tag?:number, error?:string} = await response.json();

			if (response.ok && data.tag) {
				// Add the new tag to the list and select it
				const newTag = {
					id: data.tag,
					name: newTagName.trim(),
					color: selectedColor?.name || 'blue',
					created_at: null,
				};
				tags = [...tags, newTag];
				selectedTags = [...selectedTags, newTag.id];

				// Reset form
				newTagName = '';
				newTagColor = 'blue';
				showNewTagForm = false;
			} else if (response.status === 409 && data.tag) {
				// Tag already exists, select it if not already selected
				const existingTag = data.tag;
				if (!selectedTags.includes(existingTag)) {
					selectedTags = [...selectedTags, existingTag];
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
</script>

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
				class="transition-all duration-200 {selectedTags.includes(tag.id) ? getSelectedTagClasses(tag.color) : getNeutralTagClasses()}"
			>
				{tag.name}
			</button>
		{/each}

		{#if tags.length === 0}
			<p class="text-sm text-gray-500">Nenhuma tag disponível. Crie a primeira!</p>
		{/if}
	</div>
</div>