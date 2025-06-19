<script lang="ts">
	import DocumentCard from './DocumentCard.svelte';
	import PdfView from './PdfView.svelte';
	import MeetingInfoCard from './MeetingInfoCard.svelte';
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { getTagClasses } from '$lib/colors';
	import { calculateVotingResult, getVoteStatistics } from '$lib/voting';
	import branding from '$lib/config/branding';

	let { data } = $props();

	let initiative = data.initiative;

	function formatDate(dateStr: string | null) {
		if (!dateStr) return 'Data não disponível';
		return new Date(dateStr).toLocaleDateString('pt-PT', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	let voteResults = initiative?.votes ? getVoteStatistics(initiative.votes) : null;
	let votingResult = initiative?.votes ? calculateVotingResult(initiative.votes) : null;

	// Separate regular documents from proposal documents
	const regularDocuments = initiative?.documents?.filter(doc => !doc.original_filename.startsWith('Proposta:') &&
		!doc.filename.startsWith('proposal-')) || [];

	const proposalDocuments = initiative?.documents?.filter(doc => doc.original_filename.startsWith('Proposta:') ||
		doc.filename.startsWith('proposal-')) || [];
</script>

<svelte:head>
	<title>{initiative.title} - {branding.siteName}</title>
	<meta
		name="description"
		content={initiative.description || initiative.title}
	/>
</svelte:head>

<!-- Main Content -->
<main class="container mx-auto px-4 py-8">
	<!-- Responsive layout container - centers when no PDF, 2-column when PDF exists, stacks on mobile -->
	<div class="flex flex-col lg:flex-row gap-6 {proposalDocuments.length > 0 ? 'max-w-7xl' : 'max-w-4xl justify-center'} mx-auto">
		<!-- Main content column -->
		<div class="flex-1 max-w-4xl flex flex-col gap-6 order-1">
			<!-- Breadcrumb -->
			<nav>
				<ol class="flex items-center space-x-2 text-sm text-gray-500">
					<li><a href="/" class="hover:text-blue-600">Iniciativas</a></li>
					<li class="before:content-['/'] before:mx-2">
						{initiative.parish_name}
					</li>
					<li class="before:content-['/'] before:mx-2 text-gray-900 truncate">
						{initiative.title}
					</li>
				</ol>
			</nav>

			<!-- Main Initiative Card -->
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<CardTitle class="text-2xl">{initiative.title}</CardTitle>
								{#if votingResult && initiative.votes && initiative.votes.length > 0}
									<span class="px-3 py-1 rounded-full text-sm font-medium {votingResult.className}">
										{votingResult.label}
									</span>
								{/if}
							</div>
							<CardDescription class="text-lg">
								{initiative.parish_name}
							</CardDescription>
						</div>
						<div class="flex items-center gap-2">
							{#if data.user}
								<Button variant="outline" size="sm" href="/backoffice/initiatives/{initiative.id}">
									Editar
								</Button>
							{/if}
						</div>
					</div>

					<!-- Tags -->
					{#if initiative.tags && initiative.tags.length > 0}
						<div class="flex flex-wrap gap-2 mt-4">
							{#each initiative.tags as tag (tag.id)}
								<span
									class="px-3 py-1 rounded-full text-sm font-medium {getTagClasses(
										tag.color,
									)}"
								>
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}
				</CardHeader>

				<CardContent class="space-y-6">
					<!-- Description -->
					{#if initiative.description}
						<div>
							<h3 class="text-lg font-semibold mb-2">Resumo</h3>
							<p class="text-gray-700">{initiative.description}</p>
						</div>
					{/if}

					<!-- Content -->
					{#if initiative.content}
						<div>
							<h3 class="text-lg font-semibold mb-2">Descrição Detalhada</h3>
							<div class="prose prose-gray max-w-none">
								{#each initiative.content.split('\n') as paragraph (paragraph)}
									{#if paragraph.trim()}
										<p class="mb-4">{paragraph}</p>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					<!-- Meta Information -->
					<div class="border-t pt-4">
						<div
							class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
						>
							<div>
								<span class="font-medium">Data de criação:</span>
								{formatDate(initiative.created_at)}
							</div>
							{#if initiative.submission_date}
								<div>
									<span class="font-medium">Data de submissão:</span>
									{formatDate(initiative.submission_date)}
								</div>
							{/if}
							{#if initiative.vote_date}
								<div>
									<span class="font-medium">Data da votação:</span>
									{formatDate(initiative.vote_date)}
								</div>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Meeting Information -->
			<MeetingInfoCard {initiative} {formatDate} />

			<!-- Documents -->
			{#if regularDocuments && regularDocuments.length > 0}
				<DocumentCard initiative={{ ...initiative, documents: regularDocuments }} />
			{/if}

			<!-- Voting Results -->
			{#if initiative.votes && initiative.votes.length > 0 && voteResults}
				<Card>
					<CardHeader>
						<CardTitle>Detalhes da Votação</CardTitle>
						<CardDescription>
							Votação realizada na Assembleia de Freguesia
						</CardDescription>
					</CardHeader>
					<CardContent>
						<!-- Vote Summary -->
						<div class="grid grid-cols-3 gap-4 mb-4">
							<div class="text-center">
								<div class="text-lg font-bold text-green-600">
									{voteResults.favor}
								</div>
								<div class="text-xs text-gray-600">
									A Favor ({voteResults.favorPercent}%)
								</div>
							</div>
							<div class="text-center">
								<div class="text-lg font-bold text-red-600">
									{voteResults.against}
								</div>
								<div class="text-xs text-gray-600">
									Contra ({voteResults.againstPercent}%)
								</div>
							</div>
							<div class="text-center">
								<div class="text-lg font-bold text-gray-600">
									{voteResults.abstention}
								</div>
								<div class="text-xs text-gray-600">
									Abstenções ({voteResults.abstentionPercent}%)
								</div>
							</div>
						</div>

						<!-- Vote Progress Bar -->
						<div class="w-full bg-gray-200 rounded-full h-2 mb-6">
							<div class="flex h-2 rounded-full overflow-hidden">
								{#if voteResults.favorPercent > 0}
									<div
										class="bg-green-500"
										style="width: {voteResults.favorPercent}%"
									></div>
								{/if}
								{#if voteResults.againstPercent > 0}
									<div
										class="bg-red-500"
										style="width: {voteResults.againstPercent}%"
									></div>
								{/if}
								{#if voteResults.abstentionPercent > 0}
									<div
										class="bg-gray-400"
										style="width: {voteResults.abstentionPercent}%"
									></div>
								{/if}
							</div>
						</div>

						<!-- Detailed Votes -->
						<div>
							<h4 class="font-semibold mb-3">Votos Individuais</h4>
							<div class="space-y-2">
								{#each initiative.votes as vote (vote.id)}
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded border">
										<span class="font-medium">{vote.voter_name}</span>
										<div class="flex items-center gap-2">
											{#if vote.notes && vote.notes.trim()}
												<HoverCard.Root>
													<HoverCard.Trigger class="cursor-help">
														<InfoIcon class="w-4 h-4 text-gray-500 hover:text-gray-700" />
													</HoverCard.Trigger>
													<HoverCard.Content class="w-80">
														<div class="space-y-2">
															<h4 class="text-sm font-semibold">Observações de {vote.voter_name}</h4>
															<p class="text-sm text-gray-700">"{vote.notes}"</p>
														</div>
													</HoverCard.Content>
												</HoverCard.Root>
											{/if}
											<span
												class="text-sm px-2 py-1 rounded {vote.vote === 'favor' ?
													'bg-green-100 text-green-800' : vote.vote === 'against' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}"
											>
												{vote.vote === 'favor' ?
													'A Favor' : vote.vote === 'against' ? 'Contra' : 'Abstenção'}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>

		<!-- PDF View Component -->
		<PdfView {proposalDocuments} />
	</div>
</main>