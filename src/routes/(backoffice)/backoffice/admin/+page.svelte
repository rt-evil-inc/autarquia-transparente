<script lang="ts">
	import branding from '$lib/config/branding';
	import CreateUser from './CreateUser.svelte';
	import UserList from './UserList.svelte';
	import ParishManager from './ParishManager.svelte';

	let { data } = $props();

</script>

<svelte:head>
	<title>Admin Dashboard - {branding.siteName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Main Content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
				Admin Dashboard
			</h2>

			<!-- User Management Section -->
			<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Create New User -->
				<CreateUser parishes={data.parishes} />

				<!-- Users List -->
				<UserList users={data.users} parishes={data.parishes} />
			</div>

			<!-- Parish Management Section -->
			<div class="mt-6">
				<ParishManager parishes={data.parishes} />
			</div>

		</div>
	</main>
</div>