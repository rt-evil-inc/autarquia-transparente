import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries as db } from '$lib/server/database';
import { verifyToken } from '$lib/auth';

export const DELETE: RequestHandler = async ({ params, request }) => {
  try {
    // Get and verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

    if (!token) {
      throw error(401, { message: 'Token não encontrado' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'parish') {
      throw error(403, { message: 'Acesso negado' });
    }

    const initiativeId = parseInt(params.id);
    const documentId = parseInt(params.docId);

    if (isNaN(initiativeId) || isNaN(documentId)) {
      throw error(400, { message: 'ID inválido' });
    }

    // Verify the initiative belongs to this parish
    const initiative = db.getInitiativeById(initiativeId);
    if (!initiative || initiative.parish_id !== payload.parish_id) {
      throw error(404, { message: 'Iniciativa não encontrada' });
    }

    // Delete the document
    const deletedDocument = db.deleteInitiativeDocument(documentId);

    if (!deletedDocument) {
      throw error(404, { message: 'Documento não encontrado' });
    }

    return json({ message: 'Documento removido com sucesso' });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    console.error('Error deleting document:', err);
    throw error(500, { message: 'Erro interno do servidor' });
  }
};