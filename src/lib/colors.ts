// Predefined Tailwind color palette with modern tag styling
export interface TagColor {
  name: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  hex: string;
  lightBg?: string; // For lighter backgrounds when needed
}

export const TAG_COLORS: TagColor[] = [
	// Blues
	{ name: 'blue', label: 'Azul', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#3B82F6', lightBg: 'bg-blue-100' },
	{ name: 'blue-dark', label: 'Azul Escuro', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300', hex: '#1D4ED8', lightBg: 'bg-blue-100' },
	{ name: 'blue-light', label: 'Azul Claro', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', hex: '#60A5FA', lightBg: 'bg-sky-50' },

	// Teals and Blue-greens (avoiding pure greens)
	{ name: 'teal', label: 'Verde Azulado', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#14B8A6', lightBg: 'bg-teal-100' },

	// Pinks and Roses (avoiding reds)
	{ name: 'pink', label: 'Rosa', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', hex: '#EC4899', lightBg: 'bg-pink-100' },
	{ name: 'rose', label: 'Rosa Claro', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hex: '#F43F5E', lightBg: 'bg-rose-100' },

	// Purples
	{ name: 'purple', label: 'Roxo', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#8B5CF6', lightBg: 'bg-purple-100' },
	{ name: 'purple-dark', label: 'Roxo Escuro', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', hex: '#7C3AED', lightBg: 'bg-purple-100' },
	{ name: 'indigo', label: 'Índigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#6366F1', lightBg: 'bg-indigo-100' },
	{ name: 'violet', label: 'Violeta', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', hex: '#8B5CF6', lightBg: 'bg-violet-100' },

	// Oranges and Yellows
	{ name: 'orange', label: 'Laranja', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hex: '#F97316', lightBg: 'bg-orange-100' },
	{ name: 'amber', label: 'Âmbar', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#F59E0B', lightBg: 'bg-amber-100' },
	{ name: 'yellow', label: 'Amarelo', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hex: '#EAB308', lightBg: 'bg-yellow-100' },

	// Cyans and Others
	{ name: 'cyan', label: 'Ciano', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hex: '#06B6D4', lightBg: 'bg-cyan-100' },
	{ name: 'sky', label: 'Azul Céu', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hex: '#0EA5E9', lightBg: 'bg-sky-100' },

	// Neutrals
	{ name: 'slate', label: 'Ardósia', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', hex: '#475569', lightBg: 'bg-slate-100' },
	{ name: 'gray', label: 'Cinzento', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hex: '#4B5563', lightBg: 'bg-gray-100' },
	{ name: 'zinc', label: 'Zinco', bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', hex: '#52525B', lightBg: 'bg-zinc-100' },
	{ name: 'stone', label: 'Pedra', bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', hex: '#57534E', lightBg: 'bg-stone-100' },

	// Additional vibrant colors
	{ name: 'fuchsia', label: 'Fúcsia', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', hex: '#D946EF', lightBg: 'bg-fuchsia-100' },
	{ name: 'yellow-light', label: 'Amarelo Claro', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', hex: '#FDE047', lightBg: 'bg-yellow-50' },
	{ name: 'purple-light', label: 'Roxo Claro', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hex: '#C084FC', lightBg: 'bg-purple-50' },
	{ name: 'orange-light', label: 'Laranja Claro', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', hex: '#FB923C', lightBg: 'bg-orange-50' },
	{ name: 'teal-light', label: 'Verde Azulado Claro', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', hex: '#5EEAD4', lightBg: 'bg-teal-50' },
	{ name: 'cyan-light', label: 'Ciano Claro', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', hex: '#67E8F9', lightBg: 'bg-cyan-50' },
];

// Utility functions
export function getTagColorByHex(hex: string): TagColor | undefined {
	return TAG_COLORS.find(color => color.hex === hex);
}

export function getTagColorByName(name: string): TagColor | undefined {
	return TAG_COLORS.find(color => color.name === name);
}

export function getTagClasses(tagColor: string | null): string {
	// Handle null values - use default
	if (!tagColor) {
		const defaultColor = getDefaultTagColor();
		return `${defaultColor.bg} ${defaultColor.text} ${defaultColor.border} border`;
	}

	// First try to find by hex (for backward compatibility)
	let colorConfig = getTagColorByHex(tagColor);

	// If not found, try by name
	if (!colorConfig) {
		colorConfig = getTagColorByName(tagColor);
	}

	return colorConfig ? `${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} border` : 'bg-blue-50 text-blue-700 border-blue-200 border';
}

export function getSelectedTagClasses(tagColor: string | null): string {
	// Handle null values - use default
	if (!tagColor) {
		const defaultColor = getDefaultTagColor();
		return `text-xs px-2 py-1 rounded-full ${defaultColor.bg} ${defaultColor.text} ${defaultColor.border} border`;
	}

	// First try to find by hex (for backward compatibility)
	let colorConfig = getTagColorByHex(tagColor);

	// If not found, try by name
	if (!colorConfig) {
		colorConfig = getTagColorByName(tagColor);
	}

	if (colorConfig) {
		// Use the full color for selected state
		return `text-xs px-2 py-1 rounded-full ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} border`;
	}

	return 'text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200 border';
}

export function getNeutralTagClasses(): string {
	// Neutral styling for unselected tags
	return 'text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 border-gray-200 border';
}

export function getDefaultTagColor(): TagColor {
	return TAG_COLORS[0]; // Default to blue
}

export function randomColor(): TagColor {
	const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
	return TAG_COLORS[randomIndex];
}