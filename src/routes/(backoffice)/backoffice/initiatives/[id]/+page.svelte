<script lang="ts">
	import EditInitiative from '$lib/components/EditInitiative.svelte';

	// Re-export the unified component
	let { data } = $props();

</script>
<EditInitiative
	initiative={data.initiative}
	tags={data.tags}
/>