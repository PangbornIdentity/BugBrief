import { NextResponse } from "next/server";

const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "BugBrief API",
    version: "0.1.0",
    description: "Public-safe demo API for issue, SLA, and time-to-fix reporting.",
  },
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": { description: "Service is healthy" },
        },
      },
    },
    "/api/v1/issues": {
      get: {
        summary: "List issues",
        responses: {
          "200": { description: "Synthetic issues with calculated SLA state" },
        },
      },
    },
    "/api/v1/reports/sla": {
      get: {
        summary: "SLA report",
        responses: {
          "200": { description: "SLA summary, priority rollups, and watchlist" },
        },
      },
    },
    "/api/v1/reports/time-to-fix": {
      get: {
        summary: "Time-to-fix report",
        responses: {
          "200": { description: "P0/P1/P2 average fix times and targets" },
        },
      },
    },
    "/api/v1/reports/aging": {
      get: {
        summary: "Open issue aging report",
        responses: {
          "200": { description: "Open issues sorted by age" },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(openApiDocument);
}
