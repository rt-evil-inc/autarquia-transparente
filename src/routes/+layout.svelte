<script lang="ts">
	import '../app.css';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

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

			<!-- Menubar Navigation -->
			<div class="flex items-center space-x-2">
				<Menubar.Root class="border-none bg-transparent">
					<!-- Iniciativas as simple button -->
					<Button
						variant="ghost"
						class="h-auto px-4 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 font-medium transition-colors"
						onclick={() => window.location.href = '/'}
					>
						Iniciativas
					</Button>

					{#if data.user}
						{#if data.user.role === 'admin'}
							<!-- Admin Menu -->
							<Menubar.Menu>
								<Menubar.Trigger>
									Administração
								</Menubar.Trigger>
								<Menubar.Content class="min-w-48 bg-white border border-gray-200 shadow-lg rounded-md">
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/admin" class="flex w-full">
											Dashboard Admin
										</a>
									</Menubar.Item>
									<Menubar.Separator class="h-px bg-gray-200" />
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/admin/initiatives" class="flex w-full">
											Gerir Iniciativas
										</a>
									</Menubar.Item>
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/admin/parishes" class="flex w-full">
											Gerir Freguesias
										</a>
									</Menubar.Item>
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/admin/users" class="flex w-full">
											Gerir Utilizadores
										</a>
									</Menubar.Item>
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/admin/tags" class="flex w-full">
											Gerir Tags
										</a>
									</Menubar.Item>
								</Menubar.Content>
							</Menubar.Menu>
						{:else if data.user.role === 'parish'}
							<!-- Parish Menu -->
							<Menubar.Menu>
								<Menubar.Trigger>
									Freguesia
								</Menubar.Trigger>
								<Menubar.Content class="min-w-48 bg-white border border-gray-200 shadow-lg rounded-md">
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/parish" class="flex w-full">
											Dashboard Freguesia
										</a>
									</Menubar.Item>
									<Menubar.Separator class="h-px bg-gray-200" />
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/parish/initiatives" class="flex w-full">
											Minhas Iniciativas
										</a>
									</Menubar.Item>
									<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
										<a href="/backoffice/parish/initiatives/new" class="flex w-full">
											Nova Iniciativa
											<Menubar.Shortcut>⌘N</Menubar.Shortcut>
										</a>
									</Menubar.Item>
								</Menubar.Content>
							</Menubar.Menu>
						{/if}

						<!-- User Account Menu -->
						<Menubar.Menu>
							<Menubar.Trigger class="px-4 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 transition-colors">
								<div class="flex items-center space-x-2">
									<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
										<span class="text-xs font-medium text-blue-700">
											{data.user.email.charAt(0).toUpperCase()}
										</span>
									</div>
									<span class="text-sm font-medium">{data.user.email}</span>
								</div>
							</Menubar.Trigger>
							<Menubar.Content class="bg-white border border-gray-200 shadow-lg rounded-md">
								<Menubar.Item disabled class="px-3 py-2 text-sm text-gray-600">
									Conta: {data.user.role === 'admin' ? 'Administrador' : 'Freguesia'}
								</Menubar.Item>
								<Menubar.Separator class="h-px bg-gray-200" />
								<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
									Perfil
								</Menubar.Item>
								<Menubar.Item class="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer transition-colors">
									Configurações
								</Menubar.Item>
								<Menubar.Separator class="h-px bg-gray-200" />
								<Menubar.Item onclick={logout} class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer transition-colors">
									Terminar Sessão
								</Menubar.Item>
							</Menubar.Content>
						</Menubar.Menu>
					{:else}
						<!-- Login Button for Non-authenticated Users -->
						<Button
							variant="outline"
							class="ml-2 border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 transition-colors"
							onclick={() => window.location.href = '/login'}
						>
							Entrar
						</Button>
					{/if}
				</Menubar.Root>
			</div>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="min-h-[calc(100vh-4rem)] bg-gray-50">
	{@render children()}
</main>