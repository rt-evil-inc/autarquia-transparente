// CSV parsing functions
export function parseCSV(text: string): string[][] {
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