// Utility functions for voting result calculations
export interface VoteResult {
	status: 'unanimous' | 'majority' | 'rejected' | 'pending';
	label: string;
	className: string;
}

export interface Vote {
	vote: 'favor' | 'against' | 'abstention';
}

/**
 * Calculate the final voting result from individual votes
 */
export function calculateVotingResult(votes: Vote[]): VoteResult {
	if (!votes || votes.length === 0) {
		return {
			status: 'pending',
			label: 'Em votação',
			className: 'bg-yellow-100 text-yellow-800',
		};
	}

	const favorVotes = votes.filter(v => v.vote === 'favor').length;
	// const againstVotes = votes.filter(v => v.vote === 'against').length;
	const totalVotes = votes.length;

	// If all votes are in favor (and there are votes), it's unanimous
	if (favorVotes === totalVotes && totalVotes > 0) {
		return {
			status: 'unanimous',
			label: 'Aprovada por unanimidade',
			className: 'bg-green-100 text-green-800',
		};
	}

	// If more than half votes are in favor, it's approved by majority
	if (favorVotes > totalVotes / 2) {
		return {
			status: 'majority',
			label: 'Aprovada por maioria',
			className: 'bg-green-100 text-green-800',
		};
	}

	// Otherwise, it's rejected
	return {
		status: 'rejected',
		label: 'Rejeitada',
		className: 'bg-red-100 text-red-800',
	};
}

/**
 * Get detailed vote statistics
 */
export function getVoteStatistics(votes: Vote[]) {
	const results = {
		favor: votes.filter(v => v.vote === 'favor').length,
		against: votes.filter(v => v.vote === 'against').length,
		abstention: votes.filter(v => v.vote === 'abstention').length,
	};

	const total = results.favor + results.against + results.abstention;

	return {
		...results,
		total,
		favorPercent: total > 0 ? Math.round((results.favor / total) * 100) : 0,
		againstPercent: total > 0 ? Math.round((results.against / total) * 100) : 0,
		abstentionPercent: total > 0 ? Math.round((results.abstention / total) * 100) : 0,
	};
}