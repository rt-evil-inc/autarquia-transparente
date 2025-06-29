<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { meetingTypeOptions, proposalTypeOptions } from '$lib';

	let {
		proposalNumber = $bindable(''),
		proposalType = $bindable(''),
		meetingNumber = $bindable(null),
		meetingDate = $bindable(''),
		meetingType = $bindable(''),
		meetingNotes = $bindable(''),
		proposalDocument = $bindable(null),
		proposalDocumentInput = $bindable(undefined),
	}: {
		proposalNumber: string,
		proposalType: string,
		meetingNumber: number | null,
		meetingDate: string,
		meetingType: string,
		meetingNotes: string,
		proposalDocument: File | null,
		proposalDocumentInput: FileList | undefined
	} = $props();

	// Validate proposal number format (e.g., "37/2025" or "37-A/2025")
	function validateProposalNumber(value: string): boolean {
		if (!value.trim()) return true; // Allow empty
		const pattern = /^\d+(-[A-Z])?\/\d{4}$/;
		return pattern.test(value);
	}

	let proposalNumberError = $derived(!validateProposalNumber(proposalNumber));
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-900">Informações da Reunião</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Proposal Number -->
		<div class="flex flex-col gap-1.5">
			<Label for="proposalNumber">Nº da Proposta</Label>
			<Input
				id="proposalNumber"
				bind:value={proposalNumber}
				placeholder="Ex: 37/2025 ou 37-A/2025"
				class={proposalNumberError ? 'border-red-500' : ''}
			/>
			{#if proposalNumberError && proposalNumber.trim()}
				<p class="text-sm text-red-600 mt-1">Formato inválido. Use: número/ano ou número-letra/ano</p>
			{/if}
		</div>

		<!-- Proposal Type -->
		<div class="flex flex-col gap-1.5">
			<Label for="proposalType">Tipo de Proposta</Label>
			<Select.Root type="single" bind:value={proposalType}>
				<Select.Trigger>
					{#if proposalType}
						{proposalTypeOptions.find(option => option.value === proposalType)?.label}
					{:else}
						Selecione o tipo
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each proposalTypeOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Meeting Number -->
		<div class="flex flex-col gap-1.5">
			<Label for="meetingNumber">Nº da Reunião</Label>
			<Input
				id="meetingNumber"
				type="number"
				bind:value={meetingNumber}
				placeholder="Ex: 15"
			/>
		</div>

		<!-- Meeting Date -->
		<div class="flex flex-col gap-1.5">
			<Label for="meetingDate">Data da Reunião</Label>
			<Input
				id="meetingDate"
				type="date"
				bind:value={meetingDate}
			/>
		</div>

		<!-- Meeting Type -->
		<div class="flex flex-col gap-1.5">
			<Label for="meetingType">Tipo de Reunião</Label>
			<Select.Root type="single" bind:value={meetingType}>
				<Select.Trigger>
					{#if meetingType}
						{meetingTypeOptions.find(option => option.value === meetingType)?.label}
					{:else}
						Selecione o tipo
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each meetingTypeOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Proposal Document -->
		<div class="flex flex-col gap-1.5">
			<Label for="proposalDocument">Documento da Proposta (PDF)</Label>
			<Input
				bind:files={proposalDocumentInput}
				type="file"
				id="proposalDocument"
				accept=".pdf"
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				onchange={e => {
					const target = e.target as HTMLInputElement;
					proposalDocument = target.files?.[0] || null;
				}}
			/>
			{#if proposalDocument}
				<div class="flex items-center justify-between mt-2 p-2 bg-green-50 rounded border">
					<div class="flex items-center space-x-2 text-sm text-green-600">
						<span>📄</span>
						<span>{proposalDocument.name} ({(proposalDocument.size / 1024 / 1024).toFixed(2)} MB)</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						type="button"
						onclick={() => {
							proposalDocument = null;
							if (proposalDocumentInput) proposalDocumentInput = undefined;
						}}
					>
						Remover
					</Button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Meeting Notes -->
	<div class="flex flex-col gap-1.5">
		<Label for="meetingNotes">Notas da Reunião</Label>
		<Textarea
			id="meetingNotes"
			bind:value={meetingNotes}
			placeholder="Observações, contexto ou informações adicionais sobre a reunião..."
			rows={4}
		/>
	</div>
</div>