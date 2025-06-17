<script lang="ts">
	import { getTagClasses } from '$lib/colors';
	export let tag: { name: string; color: string };

</script>

<span
	class="text-xs px-2 py-1 rounded-full {getTagClasses(
		tag.color,
	)}"
>
	{tag.name}
</span>