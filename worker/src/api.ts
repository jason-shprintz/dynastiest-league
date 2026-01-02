/**
 * HTTP API Handlers
 * Endpoints for fetching trade analyses
 */

import type { Env } from "./types";
import { getAnalysis, getBatchAnalyses } from "./db";

/**
 * CORS headers for API responses
 * NOTE: In production, set Access-Control-Allow-Origin to your actual frontend domain
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://example.com", // Replace with your allowed domain in production
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Handle GET /api/trade-analysis?transaction_id=...
 */
export async function handleGetAnalysis(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transaction_id");

  if (!transactionId) {
    return new Response(
      JSON.stringify({ error: "transaction_id parameter is required" }),
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }

  try {
    const analysis = await getAnalysis(env.DB, transactionId);

    if (!analysis) {
      return new Response(
        JSON.stringify({
          error: "Analysis not found",
          message: "Mike & Jim are in the film room... Check back soon!",
        }),
        {
          status: 404,
          headers: CORS_HEADERS,
        }
      );
    }

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

/**
 * Handle GET /api/trade-analyses?ids=id1,id2,id3
 */
export async function handleGetBatchAnalyses(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return new Response(
      JSON.stringify({ error: "ids parameter is required" }),
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }

  const ids = idsParam.split(",").filter((id) => id.trim().length > 0);

  if (ids.length === 0) {
    return new Response(
      JSON.stringify({ error: "At least one transaction ID is required" }),
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }

  // Limit batch size to prevent abuse
  if (ids.length > 100) {
    return new Response(
      JSON.stringify({ error: "Maximum 100 IDs allowed per request" }),
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }

  try {
    const analyses = await getBatchAnalyses(env.DB, ids);

    return new Response(JSON.stringify(analyses), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching batch analyses:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
