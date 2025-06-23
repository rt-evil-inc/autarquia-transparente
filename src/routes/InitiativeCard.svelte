<script lang="ts">
	import Tag from '$lib/components/Tag.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { calculateVotingResult } from '$lib/voting';
	import type { InitiativeListData } from './+page';

	let { initiative }: { initiative: InitiativeListData['initiatives'][number] } = $props();

	function formatDate(dateStr: string | Date | null) {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('pt-PT');
	}
</script>

<a href="/iniciativa/{initiative.id}" class="block group h-full">
	<Card
		class="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col overflow-hidden {initiative.cover_image ? 'pt-0' : ''}"
	>
		<!-- Cover Image -->
		{#if initiative.cover_image}
			<div class="relative aspect-[16/9] overflow-hidden bg-gray-100">
				<img
					src="/api/uploads/{initiative.cover_image}"
					alt={initiative.title}
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					loading="lazy"
				/>
			</div>
		{/if}

		<CardHeader class="flex-shrink-0">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<CardTitle
						class="text-lg leading-tight mb-2 group-hover:text-blue-600"
					>
						{initiative.title}
					</CardTitle>
					<CardDescription>
						{initiative.parish_name}
					</CardDescription>
				</div>
			</div>
		</CardHeader>

		<CardContent class="flex-1 flex flex-col">
			{#if initiative.description}
				<p
					class="text-gray-600 text-sm mb-4 line-clamp-3"
				>
					{initiative.description}
				</p>
			{/if}

			<!-- Tags -->
			{#if initiative.tags && initiative.tags.length > 0}
				<div class="flex flex-wrap gap-1 mb-4">
					{#each initiative.tags as tag (tag.id)}
						<Tag tag={tag} />
					{/each}
				</div>
			{/if}

			<!-- Meta Info -->
			<div class="text-xs text-gray-500 space-y-1 mt-auto">
				{#if initiative.votes && initiative.votes.length > 0}
					{@const votingResult = calculateVotingResult(initiative.votes)}
					<div class="flex items-center gap-2">
						<span class="px-2 py-1 rounded-full text-xs font-medium {votingResult.className}">
							{votingResult.label}
						</span>
					</div>
				{/if}
				<div>
					{#if initiative.meeting_date}
						{formatDate(initiative.meeting_date)}
					{:else}
						Data indisponível
					{/if}
				</div>

			</div>
		</CardContent>
	</Card>
</a>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>