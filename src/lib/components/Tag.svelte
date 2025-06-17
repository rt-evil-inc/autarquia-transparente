<script lang="ts">
	import { getTagClasses } from '$lib/colors';
	export let tag: { name: string; color: string | null };

</script>

<span
	class="text-xs px-2 py-1 rounded-full {getTagClasses(
		tag.color || '#3B82F6',
	)}"
>
	{tag.name}
</span>