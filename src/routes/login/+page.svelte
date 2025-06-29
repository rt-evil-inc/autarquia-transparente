<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import branding from '$lib/config/branding';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect based on role
				if (data.user.role === 'admin') {
					goto('/backoffice/admin', {
						invalidateAll: true,
					});
				} else if (data.user.role === 'parish') {
					goto('/backoffice', {
						invalidateAll: true,
					});
				} else {
					goto('/');
				}
			} else {
				error = data.error || 'Login failed';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

// Redirect if already logged in - handled in +page.ts
</script>

<svelte:head>
	<title>Login - {branding.siteName}</title>
</svelte:head>

<div class="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-blue-600">{branding.siteName}</h1>
			<p class="mt-2 text-gray-600">Acesso ao painel de administração</p>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>Entrar</CardTitle>
				<CardDescription>
					Faça login para aceder ao seu painel
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form on:submit={handleLogin} class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={email}
							required
							placeholder="seu@email.pt"
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							type="password"
							bind:value={password}
							required
							placeholder="••••••••"
						/>
					</div>

					{#if error}
						<div class="text-red-600 text-sm">{error}</div>
					{/if}

					<Button
						type="submit"
						class="w-full"
						disabled={loading}
					>
						{loading ? 'A entrar...' : 'Entrar'}
					</Button>
				</form>

				<div class="mt-6 text-sm text-gray-600">
					<p><strong>Contas de teste:</strong></p>
					<p>Admin: admin@portal.pt / admin123</p>
					<p>Freguesia: parque@portal.pt / parish123</p>
				</div>
			</CardContent>
		</Card>
	</div>
</div>