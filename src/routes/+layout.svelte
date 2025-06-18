<script lang="ts">
	import '../app.css';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { goto, invalidateAll } from '$app/navigation';

	let { children, data } = $props();
	let mobileMenuOpen = $state(false);

	async function logout() {
		await fetch('/api/auth/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		goto('/');
		invalidateAll();
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Modern Header with Menubar -->
<header class="border-b bg-white shadow-sm">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<div class="flex items-center space-x-4">
				<a href="/" class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd"/>
						</svg>
					</div>
					<div>
						<h1 class="text-xl font-bold text-gray-900">Portal do Autarca</h1>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation Menu -->
			<div class="hidden md:flex items-center space-x-2">
				<NavigationMenu.Root viewport={false}>
					<NavigationMenu.List>
						<!-- Public Iniciativas Link -->
						<NavigationMenu.Item>
							<NavigationMenu.Link>
								{#snippet child()}
									<a href="/" class="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
										Iniciativas
									</a>
								{/snippet}
							</NavigationMenu.Link>
						</NavigationMenu.Item>

						<!-- Public Autarcas Link -->
						<NavigationMenu.Item>
							<NavigationMenu.Link>
								{#snippet child()}
									<a href="/autarcas" class="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
										Autarcas
									</a>
								{/snippet}
							</NavigationMenu.Link>
						</NavigationMenu.Item>

						{#if data.user}
							<!-- Minhas Iniciativas Menu -->
							<NavigationMenu.Item>
								<NavigationMenu.Trigger onclick={() => { goto('/backoffice'); }}>Minhas Iniciativas</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[200px] gap-2 p-2">
										<li>
											<NavigationMenu.Link href="/backoffice/initiatives/new">
												<div class="font-medium">Nova</div>
												<div class="text-muted-foreground text-sm">
													Criar uma nova iniciativa
												</div>
											</NavigationMenu.Link>
										</li>
									</ul>
								</NavigationMenu.Content>
							</NavigationMenu.Item>

							<!-- Admin/Management Menu - simplified -->
							<NavigationMenu.Item>
								<NavigationMenu.Link>
									{#snippet child()}
										<a href="/backoffice/admin" class="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
											Administração
										</a>
									{/snippet}
								</NavigationMenu.Link>
							</NavigationMenu.Item>

							<!-- User Account Menu -->
							<NavigationMenu.Item>
								<NavigationMenu.Trigger>
									<div class="flex items-center space-x-2">
										<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
											<span class="text-xs font-medium text-blue-700">
												{data.user.email.charAt(0).toUpperCase()}
											</span>
										</div>
										<span class="text-sm font-medium">{data.user.email}</span>
									</div>
								</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[200px] gap-2 p-2">
										<li>
											<NavigationMenu.Link href="#" onclick={logout} class="text-red-600 hover:text-red-700">
												<div class="font-medium">Terminar Sessão</div>
											</NavigationMenu.Link>
										</li>
									</ul>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						{:else}
							<!-- Login Button for Non-authenticated Users -->
							<NavigationMenu.Item>
								<NavigationMenu.Link>
									{#snippet child()}
										<a href="/login" class="group inline-flex h-10 w-max items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
											Entrar
										</a>
									{/snippet}
								</NavigationMenu.Link>
							</NavigationMenu.Item>
						{/if}
					</NavigationMenu.List>
				</NavigationMenu.Root>
			</div>

			<!-- Mobile Hamburger Menu Button -->
			<div class="md:hidden">
				<button
					onclick={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
					aria-expanded={mobileMenuOpen}
				>
					<span class="sr-only">Open main menu</span>
					{#if mobileMenuOpen}
						<!-- Close icon -->
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<!-- Hamburger icon -->
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-gray-200 bg-white">
				<div class="px-2 pt-2 pb-3 space-y-1">
					<!-- Public Navigation Links -->
					<a href="/" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
						Iniciativas
					</a>
					<a href="/autarcas" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
						Autarcas
					</a>

					{#if data.user}
						<!-- User Navigation Links -->
						<div class="border-t border-gray-200 pt-4 mt-4">
							<div class="px-3 py-2">
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<span class="text-sm font-medium text-blue-700">
											{data.user.email.charAt(0).toUpperCase()}
										</span>
									</div>
									<div class="text-sm font-medium text-gray-900">{data.user.email}</div>
								</div>
							</div>
							<a href="/backoffice" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
								Minhas Iniciativas
							</a>
							<a href="/backoffice/initiatives/new" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
								Nova Iniciativa
							</a>
							<a href="/backoffice/admin" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
								Administração
							</a>
							<button onclick={logout} class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50">
								Terminar Sessão
							</button>
						</div>
					{:else}
						<!-- Login Link for Non-authenticated Users -->
						<div class="border-t border-gray-200 pt-4 mt-4">
							<a href="/login" onclick={closeMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50">
								Entrar
							</a>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>

<!-- Main Content -->
<main class="min-h-[calc(100vh-4rem)] bg-gray-50">
	{@render children()}
</main>