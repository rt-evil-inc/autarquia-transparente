<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import EditIcon from '@lucide/svelte/icons/edit';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import UsersIcon from '@lucide/svelte/icons/users';
	import '../app.css';

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
		closeMobileMenu();
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleMobileNavigation(url: string) {
		goto(url);
		closeMobileMenu();
	}
</script>

<!-- Modern Header with Menubar -->
<header class="sticky top-0 z-50 border-b bg-white shadow-sm">
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

			<!-- Mobile Drawer Menu Button -->
			<div class="md:hidden">
				<Drawer.Root bind:open={mobileMenuOpen}>
					<Drawer.Trigger
						class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
					>
						<span class="sr-only">Open navigation menu</span>
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					</Drawer.Trigger>
					<Drawer.Content>
						<div class="mx-auto w-full max-w-sm">
							<Drawer.Header>
								<Drawer.Title>Navegação</Drawer.Title>
								<Drawer.Description>Aceda às diferentes secções do portal</Drawer.Description>
							</Drawer.Header>
							<div class="p-4 pb-0 space-y-2">
								<!-- Public Navigation Links -->
								<button
									onclick={() => handleMobileNavigation('/')}
									class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
								>
									<FileTextIcon class="w-5 h-5" />
									<span>Iniciativas</span>
								</button>
								<button
									onclick={() => handleMobileNavigation('/autarcas')}
									class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
								>
									<UsersIcon class="w-5 h-5" />
									<span>Autarcas</span>
								</button>

								{#if data.user}
									<!-- User Section -->
									<div class="border-t border-gray-200 pt-4 mt-4">
										<div class="px-4 py-3 bg-blue-50 rounded-lg mb-2">
											<div class="flex items-center space-x-3">
												<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
													<span class="text-sm font-bold text-blue-700">
														{data.user.email.charAt(0).toUpperCase()}
													</span>
												</div>
												<div>
													<div class="text-sm font-medium text-gray-900">{data.user.email}</div>
													<div class="text-xs text-gray-500">Utilizador autenticado</div>
												</div>
											</div>
										</div>

										<button
											onclick={() => handleMobileNavigation('/backoffice')}
											class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
										>
											<EditIcon class="w-5 h-5" />
											<span>Minhas Iniciativas</span>
										</button>
										<button
											onclick={() => handleMobileNavigation('/backoffice/initiatives/new')}
											class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
										>
											<PlusIcon class="w-5 h-5" />
											<span>Nova Iniciativa</span>
										</button>
										<button
											onclick={() => handleMobileNavigation('/backoffice/admin')}
											class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
										>
											<SettingsIcon class="w-5 h-5" />
											<span>Administração</span>
										</button>
										<button
											onclick={logout}
											class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
										>
											<LogOutIcon class="w-5 h-5" />
											<span>Terminar Sessão</span>
										</button>
									</div>
								{:else}
									<!-- Login Section for Non-authenticated Users -->
									<div class="border-t border-gray-200 pt-4 mt-4">
										<button
											onclick={() => handleMobileNavigation('/login')}
											class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
										>
											<LogInIcon class="w-5 h-5" />
											<span>Entrar</span>
										</button>
									</div>
								{/if}
							</div>
							<Drawer.Footer>
								<Drawer.Close class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
									Fechar
								</Drawer.Close>
							</Drawer.Footer>
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="min-h-[calc(100vh-4rem)] bg-gray-50">
	{@render children()}
</main>