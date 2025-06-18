<script>
	import EditInitiative from '$lib/components/EditInitiative/EditInitiative.svelte';
	let { data } = $props();

</script>

<EditInitiative tags={data.tags} />