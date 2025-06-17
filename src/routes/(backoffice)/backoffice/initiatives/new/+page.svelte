<script>
	import EditInitiative from '$lib/components/EditInitiative.svelte';
	let { data } = $props();

</script>

<EditInitiative tags={data.tags} />