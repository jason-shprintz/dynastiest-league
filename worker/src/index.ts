/**
 * Cloudflare Worker Entry Point
 * Handles HTTP requests and scheduled cron jobs
 */

import type { Env } from "./types";
import { handleScheduled } from "./cron";
import {
  handleOptions,
  handleGetAnalysis,
  handleGetBatchAnalyses,
} from "./api";

/**
 * Worker export interface
 */
export default {
  /**
   * Handle HTTP requests
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    // Only allow GET requests
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Route requests
    if (url.pathname === "/api/trade-analysis") {
      return handleGetAnalysis(request, env);
    }

    if (url.pathname === "/api/trade-analyses") {
      return handleGetBatchAnalyses(request, env);
    }

    // Health check endpoint
    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          service: "dynastiest-league-worker",
          version: env.ANALYSIS_VERSION 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },

  /**
   * Handle scheduled cron triggers
   */
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    try {
      await handleScheduled(env);
    } catch (error) {
      console.error("Error in scheduled handler:", error);
    }
  },
};
