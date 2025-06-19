<script>
	import EditInitiative from '$lib/components/EditInitiative/EditInitiative.svelte';
	let { data } = $props();
	let defaultParish = data.parishes.find(p => p.id === data.user.parish_id)?.code || '';
</script>

<EditInitiative tags={data.tags} parishes={data.parishes} {defaultParish} />