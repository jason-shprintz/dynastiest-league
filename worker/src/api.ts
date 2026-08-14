/**
 * HTTP API Handlers
 * Endpoints for fetching trade analyses
 */

import type { Env } from './types';
import {
  getAnalysis,
  getBatchAnalyses,
  getDraftPickAnalyses,
  getTeamDraftGrades,
} from './db';

const ALLOWED_ORIGINS = [
  'https://dynastiestleague.com',
  'https://dynastiest-league.pages.dev',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.dynastiest-league\.pages\.dev$/.test(origin) ||
    origin.startsWith('http://localhost:');

  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Handle GET /api/trade-analysis?transaction_id=...
 */
export async function handleGetAnalysis(
  request: Request,
  env: Env,
): Promise<Response> {
  const cors = getCorsHeaders(request);
  const url = new URL(request.url);
  const transactionId = url.searchParams.get('transaction_id');

  if (!transactionId) {
    return new Response(
      JSON.stringify({ error: 'transaction_id parameter is required' }),
      { status: 400, headers: cors },
    );
  }

  try {
    const analysis = await getAnalysis(env.DB, transactionId);

    if (!analysis) {
      return new Response(
        JSON.stringify({
          error: 'Analysis not found',
          message: 'Mike & Jim are in the film room... Check back soon!',
        }),
        { status: 404, headers: cors },
      );
    }

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: cors,
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: cors,
    });
  }
}

/**
 * Handle GET /api/trade-analyses?ids=id1,id2,id3
 */
export async function handleGetBatchAnalyses(
  request: Request,
  env: Env,
): Promise<Response> {
  const cors = getCorsHeaders(request);
  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');

  if (!idsParam) {
    return new Response(
      JSON.stringify({ error: 'ids parameter is required' }),
      { status: 400, headers: cors },
    );
  }

  const ids = idsParam.split(',').filter((id) => id.trim().length > 0);

  if (ids.length === 0) {
    return new Response(
      JSON.stringify({ error: 'At least one transaction ID is required' }),
      { status: 400, headers: cors },
    );
  }

  if (ids.length > 100) {
    return new Response(
      JSON.stringify({ error: 'Maximum 100 IDs allowed per request' }),
      { status: 400, headers: cors },
    );
  }

  try {
    const analyses = await getBatchAnalyses(env.DB, ids);

    return new Response(JSON.stringify(analyses), {
      status: 200,
      headers: cors,
    });
  } catch (error) {
    console.error('Error fetching batch analyses:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: cors,
    });
  }
}

/**
 * Handle GET /api/draft-pick-analyses?draft_id=...
 * Returns all pick analyses for a draft as a map keyed by pick_no
 */
export async function handleGetDraftPickAnalyses(
  request: Request,
  env: Env,
): Promise<Response> {
  const cors = getCorsHeaders(request);
  const url = new URL(request.url);
  const draftId = url.searchParams.get('draft_id');

  if (!draftId) {
    return new Response(
      JSON.stringify({ error: 'draft_id parameter is required' }),
      { status: 400, headers: cors },
    );
  }

  try {
    const analyses = await getDraftPickAnalyses(env.DB, draftId);
    return new Response(JSON.stringify(analyses), {
      status: 200,
      headers: cors,
    });
  } catch (error) {
    console.error('Error fetching draft pick analyses:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: cors,
    });
  }
}

/**
 * Handle GET /api/team-draft-grades?draft_id=...
 * Returns all team draft grades for a draft as a map keyed by roster_id
 */
export async function handleGetTeamDraftGrades(
  request: Request,
  env: Env,
): Promise<Response> {
  const cors = getCorsHeaders(request);
  const url = new URL(request.url);
  const draftId = url.searchParams.get('draft_id');

  if (!draftId) {
    return new Response(
      JSON.stringify({ error: 'draft_id parameter is required' }),
      { status: 400, headers: cors },
    );
  }

  try {
    const grades = await getTeamDraftGrades(env.DB, draftId);
    return new Response(JSON.stringify(grades), {
      status: 200,
      headers: cors,
    });
  } catch (error) {
    console.error('Error fetching team draft grades:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: cors,
    });
  }
}
