<script lang="ts">
	import DownloadIcon from '@lucide/svelte/icons/download';

	interface Document {
		id: number;
		original_filename: string;
		filename: string;
		file_size: number;
		mime_type: string;
	}

	interface Props {
		proposalDocuments: Document[];
	}

	let { proposalDocuments }: Props = $props();
</script>

<!-- Conditional PDF column - only shows when proposal documents exist -->
{#if proposalDocuments.length > 0}
	<div class="w-full lg:w-3/5 flex-shrink-0 order-2">
		<div class="lg:sticky lg:top-4">
			{#each proposalDocuments as doc (doc.id)}
				{#if doc.mime_type === 'application/pdf'}
					<div class="border rounded-lg overflow-hidden shadow-lg">
						<div class="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
							<div>
								<h4 class="text-sm font-medium text-gray-900 mb-1">Documento da Proposta</h4>
								<p class="text-xs text-gray-500">
									{doc.original_filename.replace('Proposta: ', '')} • {Math.round(doc.file_size / 1024)} KB
								</p>
							</div>
							<a
								href="/api/uploads/{doc.filename}"
								download={doc.original_filename}
								class="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-200 transition-colors"
								title="Download PDF"
							>
								<DownloadIcon class="w-4 h-4 text-gray-600" />
							</a>
						</div>
						<iframe
							src="/api/uploads/{doc.filename}"
							class="w-full h-[500px] lg:h-[calc(100vh-120px)]"
							title="Documento da Proposta"
						>
						</iframe>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}