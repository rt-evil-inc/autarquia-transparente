<script lang="ts">
	import '../app.css';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { goto } from '$app/navigation';

	let { children, data } = $props();

	function logout() {
		window.location.href = '/api/auth/logout';
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

			<!-- Navigation Menu -->
			<div class="flex items-center space-x-2">
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

						{#if data.user}
							<!-- Minhas Iniciativas Menu -->
							<NavigationMenu.Item>
								<NavigationMenu.Trigger onclick={() => { goto('/backoffice'); }}>Minhas Iniciativas</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[200px] gap-2 p-2">
										<li>
											<NavigationMenu.Link href="/backoffice">
												<div class="font-medium">Ver</div>
												<div class="text-muted-foreground text-sm">
													Ver todas as suas iniciativas
												</div>
											</NavigationMenu.Link>
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
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="min-h-[calc(100vh-4rem)] bg-gray-50">
	{@render children()}
</main>