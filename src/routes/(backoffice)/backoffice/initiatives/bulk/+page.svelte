<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Progress } from '$lib/components/ui/progress';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import SelectAutarchy from '$lib/components/SelectAutarchy.svelte';

	// Types
	interface Initiative {
		title: string;
		description: string;
		content: string;
		parish_id: number | null;
		status: string;
		proposal_number: string;
		proposal_type: string;
		meeting_date: string;
		meeting_type: string;
		meeting_notes: string;
		votes: Vote[];
		_originalRow: string[];
		_rowIndex: number;
	}

	interface Vote {
		voter_name: string;
		vote: 'favor' | 'against' | 'abstention';
		notes: string;
	}

	let { data } = $props();
	// File upload state
	let fileInput: FileList | undefined = $state(undefined);
	let selectedFile: File | null = $state(null);
	let csvContent = $state('');
	let parsedData: Initiative[] = $state([]);
	let isProcessing = $state(false);
	let error = $state('');
	let success = $state('');
	let processingProgress = $state(0);

	// Preview state
	let showPreview = $state(false);
	let selectedParish = $state('');
	let defaultMeetingType = $state('private');
	let defaultProposalType = $state('proposal');

	// CSV parsing functions
	function parseCSV(text: string): string[][] {
		const lines = text.split('\n');
		const result: string[][] = [];
		let currentRow: string[] = [];
		let currentField = '';
		let inQuotes = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			for (let j = 0; j < line.length; j++) {
				const char = line[j];

				if (char === '"') {
					if (inQuotes && line[j + 1] === '"') {
						// Escaped quote
						currentField += '"';
						j++; // Skip next quote
					} else {
						// Toggle quote state
						inQuotes = !inQuotes;
					}
				} else if (char === ';' && !inQuotes) {
					// Field separator
					currentRow.push(currentField.trim());
					currentField = '';
				} else {
					currentField += char;
				}
			}

			// End of line
			if (!inQuotes) {
				currentRow.push(currentField.trim());
				if (currentRow.some(field => field.length > 0)) {
					result.push(currentRow);
				}
				currentRow = [];
				currentField = '';
			} else {
				// Multi-line field, add newline
				currentField += '\n';
			}
		}

		// Add last row if not empty
		if (currentRow.length > 0 || currentField.length > 0) {
			currentRow.push(currentField.trim());
			result.push(currentRow);
		}

		return result;
	}

	function convertCSVToInitiatives(csvData: string[][]): Initiative[] {
		if (csvData.length === 0) return [];

		// Expected headers: Nº da Reunião (votação),Tipo de Reunião (votação),Data da Reunião (votação),Media,Tipo de Proposta,Nº,Nome da proposta,Descrição,Temas,Resultado,Situação Atual,DOC,PDF,Boletim Municipal,Notas
		const dataRows = csvData.slice(1);

		return dataRows.map((row, index) => {
			const [
				numeroReuniao,
				tipoReuniao,
				dataReuniao,
				media,
				tipoProposta,
				numeroProposta,
				nomeProposta,
				descricao,
				temas,
				resultado,
				situacaoAtual,
				doc,
				pdf,
				boletimMunicipal,
				notas,
			] = row;

			// Parse date from numeric format (Excel date serial number)
			let meetingDate = '';
			if (dataReuniao) {
				try {
					// If it's a numeric value (Excel date), convert it
					if (!isNaN(Number(dataReuniao))) {
						// Excel date serial number to JavaScript date
						const excelDate = Number(dataReuniao);
						const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
						meetingDate = jsDate.toISOString().split('T')[0];
					} else {
						// Try to parse as regular date string
						const date = new Date(dataReuniao);
						if (!isNaN(date.getTime())) {
							meetingDate = date.toISOString().split('T')[0];
						}
					}
				} catch {
					console.warn('Could not parse date:', dataReuniao);
				}
			}

			// Extract proposal number
			let proposalNumber = numeroProposta || numeroReuniao || '';

			// Determine proposal type
			let proposalType = defaultProposalType;
			if (tipoProposta) {
				const tipo = tipoProposta.toLowerCase();
				if (tipo.includes('proposta')) {
					proposalType = 'proposal';
				} else if (tipo.includes('alteração') || tipo.includes('emenda')) {
					proposalType = 'amendment';
				}
			}

			// Parse voting results - simpler approach since detailed vote counts aren't in this format
			const votes: Vote[] = [];

			// Create a general vote result based on the "Resultado" field
			if (resultado) {
				const resultadoLower = resultado.toLowerCase();
				if (resultadoLower.includes('aprovad')) {
					votes.push({
						voter_name: 'Resultado da Votação',
						vote: 'favor',
						notes: resultado,
					});
				} else if (resultadoLower.includes('rejeitad') || resultadoLower.includes('chumbad')) {
					votes.push({
						voter_name: 'Resultado da Votação',
						vote: 'against',
						notes: resultado,
					});
				}
			}

			// Build meeting notes
			let meetingNotes = '';
			if (temas) meetingNotes += `Temas: ${temas}\n`;
			if (resultado) meetingNotes += `Resultado: ${resultado}\n`;
			if (situacaoAtual) meetingNotes += `Situação Atual: ${situacaoAtual}\n`;
			if (doc) meetingNotes += `DOC: ${doc}\n`;
			if (pdf) meetingNotes += `PDF: ${pdf}\n`;
			if (boletimMunicipal) meetingNotes += `Boletim Municipal: ${boletimMunicipal}\n`;
			if (notas) meetingNotes += `Notas: ${notas}\n`;
			if (media) meetingNotes += `Media: ${media}\n`;

			// Build content from description and themes
			let content = '';
			if (descricao) content += `${descricao}\n\n`;
			if (temas) content += `Temas: ${temas}\n`;
			if (resultado) content += `\nResultado: ${resultado}`;

			return {
				// Basic initiative data
				title: nomeProposta || `Proposta ${proposalNumber || index + 1}`,
				description: descricao || nomeProposta || '',
				content: content.trim() || nomeProposta || '',
				parish_id: null, // Will be set when importing
				status: resultado?.toLowerCase().includes('aprovad') ? 'approved' : 'rejected',

				// Meeting data
				proposal_number: proposalNumber,
				proposal_type: proposalType,
				meeting_date: meetingDate,
				meeting_type: tipoReuniao?.toLowerCase() === 'privada' ? 'private' : defaultMeetingType,
				meeting_notes: meetingNotes.trim(),

				// Vote data
				votes: votes,

				// Metadata
				_originalRow: row,
				_rowIndex: index + 1,
			};
		});
	}
	// Encoding detection and conversion
	function detectAndConvertEncoding(buffer: ArrayBuffer): string {
		// Try to decode as UTF-8 first
		try {
			const decoder = new TextDecoder('utf-8', { fatal: true });
			const utf8Text = decoder.decode(buffer);
			// If successful and contains Portuguese characters, it's likely UTF-8
			return utf8Text;
		} catch {
			// UTF-8 failed, try ISO 8859-1 (Latin-1)
			try {
				const decoder = new TextDecoder('iso-8859-1');
				const latin1Text = decoder.decode(buffer);
				console.log('Detected ISO 8859-1 encoding, converting to UTF-8');
				return latin1Text;
			} catch {
				// Fallback to Windows-1252 which is similar to ISO 8859-1
				try {
					const decoder = new TextDecoder('windows-1252');
					const windowsText = decoder.decode(buffer);
					console.log('Detected Windows-1252 encoding, converting to UTF-8');
					return windowsText;
				} catch {
					// Final fallback - try to read as binary and convert manually
					console.warn('Could not detect encoding, using binary fallback');
					const uint8Array = new Uint8Array(buffer);
					let result = '';
					for (let i = 0; i < uint8Array.length; i++) {
						result += String.fromCharCode(uint8Array[i]);
					}
					return result;
				}
			}
		}
	}

	function hasPortugueseChars(text: string): boolean {
		// Check for common Portuguese characters that would be mangled in wrong encoding
		const portugueseChars = /[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/;
		return portugueseChars.test(text);
	}

	function validateAndFixEncoding(text: string): string {
		// Common ISO 8859-1 to UTF-8 character mappings for Portuguese
		// Using a more robust approach with replacements
		let fixedText = text;

		// Define replacements as array of [search, replace] pairs
		const replacements = [
			// Lowercase accented characters
			['Ã¡', 'á'],
			['Ã ', 'à'],
			['Ã¢', 'â'],
			['Ã£', 'ã'],
			['Ã¤', 'ä'],
			['Ã©', 'é'],
			['Ã¨', 'è'],
			['Ãª', 'ê'],
			['Ã«', 'ë'],
			['Ã­', 'í'],
			['Ã¬', 'ì'],
			['Ã®', 'î'],
			['Ã¯', 'ï'],
			['Ã³', 'ó'],
			['Ã²', 'ò'],
			['Ã´', 'ô'],
			['Ãµ', 'õ'],
			['Ã¶', 'ö'],
			['Ãº', 'ú'],
			['Ã¹', 'ù'],
			['Ã»', 'û'],
			['Ã¼', 'ü'],
			['Ã§', 'ç'],
			['Ã±', 'ñ'],
			// Some common uppercase patterns (simplified)
			['Ã\u0087', 'Ç'],
			['Ã\u0091', 'Ñ'],
		];

		// Apply character mappings
		for (const [wrongChar, correctChar] of replacements) {
			fixedText = fixedText.replaceAll(wrongChar, correctChar);
		}

		return fixedText;
	}

	// File handling
	function handleFileSelect() {
		const file = fileInput?.[0];
		if (!file) return;

		selectedFile = file;

		if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
			error = 'Por favor selecione um arquivo CSV válido.';
			return;
		}

		// Read file as ArrayBuffer first to detect encoding
		const reader = new FileReader;
		reader.onload = e => {
			const buffer = e.target?.result as ArrayBuffer;
			if (!buffer) {
				error = 'Erro ao ler o ficheiro.';
				return;
			}

			// Detect and convert encoding
			let decodedText = detectAndConvertEncoding(buffer);

			// Check if the text looks like it has encoding issues and try to fix them
			if (!hasPortugueseChars(decodedText) || decodedText.includes('Ã')) {
				console.log('Attempting to fix encoding issues...');
				decodedText = validateAndFixEncoding(decodedText);
			}

			csvContent = decodedText;
			parseCSVData();
		};
		reader.readAsArrayBuffer(file);
	}

	function parseCSVData() {
		if (!csvContent) return;

		try {
			error = '';
			const csvRows = parseCSV(csvContent);
			parsedData = convertCSVToInitiatives(csvRows);
			showPreview = true;
		} catch (e) {
			error = `Erro ao processar CSV: ${e}`;
			parsedData = [];
			showPreview = false;
		}
	}

	async function importData() {
		if (!selectedParish || parsedData.length === 0) {
			error = 'Selecione uma freguesia e certifique-se de que há dados para importar.';
			return;
		}

		isProcessing = true;
		error = '';
		success = '';
		processingProgress = 0;

		try {
			// Import initiatives one by one to show progress
			const total = parsedData.length;
			const imported = [];
			const failed = [];

			for (let i = 0; i < parsedData.length; i++) {
				const initiative = { ...parsedData[i] };
				initiative.parish_id = parseInt(selectedParish);

				try {
					const response = await fetch('/api/backoffice/parish/initiatives', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(initiative),
					});

					if (response.ok) {
						imported.push(initiative);
					} else {
						const errorData = await response.json();
						failed.push({ initiative, error: errorData.error });
					}
				} catch {
					failed.push({ initiative, error: 'Erro de rede' });
				}

				processingProgress = ((i + 1) / total) * 100;
			}

			if (imported.length > 0) {
				success = `${imported.length} iniciativas importadas com sucesso!`;
			}

			if (failed.length > 0) {
				error = `${failed.length} iniciativas falharam na importação.`;
			}

			// Reset for next import
			if (imported.length === total) {
				selectedFile = null;
				csvContent = '';
				parsedData = [];
				showPreview = false;
				if (fileInput) fileInput = undefined;
			}
		} catch (e) {
			error = `Erro durante a importação: ${e}`;
		} finally {
			isProcessing = false;
		}
	}

	function resetImport() {
		selectedFile = null;
		csvContent = '';
		parsedData = [];
		showPreview = false;
		error = '';
		success = '';
		processingProgress = 0;
		if (fileInput) fileInput = undefined;
	}
</script>

<svelte:head>
	<title>Importação em Massa - Portal da Autarquia</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="max-w-6xl mx-auto py-6 px-4">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Importação em Massa de Iniciativas</h1>
			<p class="text-gray-600">Importe iniciativas a partir de ficheiros CSV com dados de propostas e votações.</p>
		</div>

		{#if error}
			<Alert class="mb-6 border-red-200 bg-red-50">
				<AlertDescription class="text-red-800">{error}</AlertDescription>
			</Alert>
		{/if}

		{#if success}
			<Alert class="mb-6 border-green-200 bg-green-50">
				<AlertDescription class="text-green-800">{success}</AlertDescription>
			</Alert>
		{/if}

		{#if isProcessing}
			<Card class="mb-6">
				<CardHeader>
					<CardTitle>A processar importação...</CardTitle>
					<CardDescription>Por favor aguarde enquanto as iniciativas são importadas.</CardDescription>
				</CardHeader>
				<CardContent>
					<Progress value={processingProgress} class="w-full" />
					<p class="text-sm text-gray-600 mt-2">{Math.round(processingProgress)}% concluído</p>
				</CardContent>
			</Card>
		{/if}

		<Tabs value={showPreview ? 'preview' : 'upload'} class="space-y-6">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="upload">1. Upload do Ficheiro</TabsTrigger>
				<TabsTrigger value="preview" disabled={!showPreview}>2. Pré-visualização</TabsTrigger>
			</TabsList>

			<TabsContent value="upload">
				<Card>
					<CardHeader>
						<CardTitle>Upload do Ficheiro CSV</CardTitle>
						<CardDescription>
							Selecione um ficheiro CSV com o formato esperado de propostas e votações.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- File Upload -->
						<div class="space-y-2">
							<Label for="csvFile">Ficheiro CSV</Label>
							<Input
								bind:files={fileInput}
								type="file"
								id="csvFile"
								accept=".csv"
								onchange={handleFileSelect}
							/>
							<p class="text-sm text-gray-500">
								Formato aceite: CSV (.csv) - máximo 10MB
							</p>
						</div>

						{#if selectedFile}
							<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div class="flex items-center gap-2">
									<span>📄</span>
									<div>
										<p class="font-medium">{selectedFile.name}</p>
										<p class="text-sm text-gray-600">
											{(selectedFile.size / 1024).toFixed(1)} KB
										</p>
									</div>
								</div>
							</div>
						{/if}

						<!-- CSV Format Help -->
						<div class="space-y-4">
							<h3 class="font-semibold">Formato Esperado do CSV</h3>
							<div class="bg-gray-50 p-4 rounded-lg">
								<p class="text-sm font-mono mb-2">Cabeçalhos esperados:</p>
								<code class="text-xs bg-white p-2 rounded block">
									Nº da Reunião (votação),Tipo de Reunião (votação),Data da Reunião (votação),Media,Tipo de Proposta,Nº,Nome da proposta,Descrição,Temas,Resultado,Situação Atual,DOC,PDF,Boletim Municipal,Notas
								</code>
							</div>
							<div class="text-sm text-gray-600 space-y-1">
								<p><strong>Nº da Reunião:</strong> Número identificador da reunião</p>
								<p><strong>Tipo de Reunião:</strong> Tipo da reunião (Privada, Pública, etc.)</p>
								<p><strong>Data da Reunião:</strong> Data da reunião (formato numérico ou DD/MM/AAAA)</p>
								<p><strong>Media:</strong> Tipo de media disponível (Audio, etc.)</p>
								<p><strong>Tipo de Proposta:</strong> Tipo da proposta (Proposta, Proposta de Alteração, etc.)</p>
								<p><strong>Nº:</strong> Número identificador da proposta</p>
								<p><strong>Nome da proposta:</strong> Título da proposta</p>
								<p><strong>Descrição:</strong> Descrição detalhada da proposta</p>
								<p><strong>Temas:</strong> Temas relacionados (separados por ponto e vírgula)</p>
								<p><strong>Resultado:</strong> Resultado da votação</p>
								<p><strong>Situação Atual:</strong> Estado atual da proposta (AP, RJ, etc.)</p>
								<p><strong>DOC/PDF:</strong> Links para documentos</p>
								<p><strong>Boletim Municipal:</strong> Referência ao boletim municipal</p>
								<p><strong>Notas:</strong> Notas adicionais sobre a votação</p>
							</div>
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<h4 class="font-medium text-blue-900 mb-1">✨ Suporte de Codificação</h4>
								<p class="text-sm text-blue-800">
									O sistema detecta automaticamente a codificação do ficheiro (UTF-8, ISO 8859-1, Windows-1252)
									e converte caracteres portugueses corretamente.
								</p>
							</div>
						</div>

						{#if parsedData.length > 0}
							<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
								<p class="text-green-800 font-medium">
									✅ CSV processado com sucesso!
								</p>
								<p class="text-green-700 text-sm">
									{parsedData.length} iniciativas encontradas e prontas para pré-visualização.
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="preview">
				<div class="space-y-6">
					<!-- Import Settings -->
					<Card>
						<CardHeader>
							<CardTitle>Configurações de Importação</CardTitle>
							<CardDescription>Configure os parâmetros para a importação das iniciativas.</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label for="parish">Freguesia *</Label>
									<SelectAutarchy parishes={data.parishes} bind:selectedParish={selectedParish} />
								</div>

								<div>
									<Label for="defaultMeetingType">Tipo de Reunião Padrão</Label>
									<Select.Root type="single" bind:value={defaultMeetingType}>									<Select.Trigger>
										{defaultMeetingType === 'private' ? 'Privada' :
											defaultMeetingType === 'public' ? 'Pública' : 'Extraordinária'}
									</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Item value="private" label="Privada">Privada</Select.Item>
												<Select.Item value="public" label="Pública">Pública</Select.Item>
												<Select.Item value="extraordinary" label="Extraordinária">Extraordinária</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</div>

								<div>
									<Label for="defaultProposalType">Tipo de Proposta Padrão</Label>
									<Select.Root type="single"bind:value={defaultProposalType}>
										<Select.Trigger>
											{defaultProposalType === 'proposal' ? 'Proposta' : 'Emenda'}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Item value="proposal" label="Proposta">Proposta</Select.Item>
												<Select.Item value="amendment" label="Emenda">Emenda</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Data Preview -->
					<Card>
						<CardHeader>
							<CardTitle>Pré-visualização dos Dados</CardTitle>
							<CardDescription>
								Reveja as {parsedData.length} iniciativas que serão importadas.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-4 max-h-96 overflow-y-auto">
								{#each parsedData.slice(0, 10) as item, index (index)}
									<div class="border rounded-lg p-4 bg-white">
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<h4 class="font-semibold text-sm text-gray-900 mb-2">
													{item.title}
												</h4>
												<div class="space-y-1 text-xs text-gray-600">
													<p><strong>Nº:</strong> {item.proposal_number || 'N/A'}</p>
													<p><strong>Data:</strong> {item.meeting_date || 'N/A'}</p>
													<p><strong>Tipo:</strong> {item.meeting_type === 'private' ? 'Privada' : 'Pública'}</p>
													<p><strong>Status:</strong> {item.status === 'approved' ? 'Aprovada' : 'Rejeitada'}</p>
												</div>
											</div>
											<div>
												<p class="text-xs text-gray-600 mb-2"><strong>Resultado:</strong></p>
												<div class="flex flex-wrap gap-1">
													{#each item.votes as vote (vote.voter_name)}
														<Badge variant={vote.vote === 'favor' ? 'default' :
															vote.vote === 'against' ? 'destructive' : 'secondary'}>
															{vote.voter_name}
														</Badge>
													{/each}
												</div>
												{#if item.votes.length === 0}
													<p class="text-xs text-gray-400">Sem resultado registado</p>
												{/if}
												{#if item.description}
													<p class="text-xs text-gray-600 mt-2 line-clamp-2">{item.description}</p>
												{/if}
											</div>
										</div>
									</div>
								{/each}

								{#if parsedData.length > 10}
									<div class="text-center py-4">
										<p class="text-sm text-gray-600">
											... e mais {parsedData.length - 10} iniciativas
										</p>
									</div>
								{/if}
							</div>
						</CardContent>
					</Card>

					<!-- Import Actions -->
					<Card>
						<CardContent class="pt-6">
							<div class="flex justify-between items-center">
								<div>
									<p class="text-sm text-gray-600">
										{parsedData.length} iniciativas prontas para importação
									</p>
									{#if !selectedParish}
										<p class="text-sm text-red-600">
											⚠️ Selecione uma freguesia antes de importar
										</p>
									{/if}
								</div>
								<div class="flex gap-2">
									<Button variant="outline" onclick={resetImport}>
										Recomeçar
									</Button>
									<Button
										onclick={importData}
										disabled={!selectedParish || isProcessing || parsedData.length === 0}
									>
										{isProcessing ? 'A importar...' : `Importar ${parsedData.length} Iniciativas`}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</TabsContent>
		</Tabs>
	</main>
</div>