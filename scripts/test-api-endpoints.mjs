#!/usr/bin/env node
/**
 * Dry-run API tests against the deployed backend.
 * Run: node scripts/test-api-endpoints.mjs
 * Or: node scripts/test-api-endpoints.mjs https://your-backend.onrender.com
 */
const BASE = process.argv[2] || "https://adora-ai-backend.onrender.com";

const tests = [
  {
    name: "GET /api/health (no auth, no DB)",
    method: "GET",
    path: "/api/health",
    expectStatus: 200,
    expectBody: (body) => body && body.status === "ok",
  },
  {
    name: "GET /api/project/published-projects (no auth)",
    method: "GET",
    path: "/api/project/published-projects",
    expectStatus: 200,
    expectBody: (body) => body && typeof body.projects === "object" && Array.isArray(body.projects),
  },
  {
    name: "GET /api/user/credit (no token → 401)",
    method: "GET",
    path: "/api/user/credit",
    expectStatus: 401,
  },
  {
    name: "GET /api/user/projects (no token → 401)",
    method: "GET",
    path: "/api/user/projects",
    expectStatus: 401,
  },
  {
    name: "GET /api/user/project/any-id (no token → 401)",
    method: "GET",
    path: "/api/user/project/00000000-0000-0000-0000-000000000000",
    expectStatus: 401,
  },
  {
    name: "GET /api/user/publish/any-id (no token → 401)",
    method: "GET",
    path: "/api/user/publish/00000000-0000-0000-0000-000000000000",
    expectStatus: 401,
  },
  {
    name: "POST /api/project/video (no token → 401)",
    method: "POST",
    path: "/api/project/video",
    body: { projectId: "00000000-0000-0000-0000-000000000000" },
    expectStatus: 401,
  },
  {
    name: "DELETE /api/project/any-id (no token → 401)",
    method: "DELETE",
    path: "/api/project/00000000-0000-0000-0000-000000000000",
    expectStatus: 401,
  },
  {
    name: "POST /api/clerk (invalid webhook → 400)",
    method: "POST",
    path: "/api/clerk",
    body: "{}",
    headers: { "Content-Type": "application/json" },
    expectStatus: [400, 503],
  },
];

async function run() {
  console.log("Base URL:", BASE);
  console.log("");

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const url = BASE + t.path;
    const options = {
      method: t.method,
      headers: {
        "Content-Type": "application/json",
        ...t.headers,
      },
    };
    if (t.body !== undefined) {
      options.body = typeof t.body === "string" ? t.body : JSON.stringify(t.body);
    }

    try {
      const res = await fetch(url, options);
      const expectedStatuses = Array.isArray(t.expectStatus) ? t.expectStatus : [t.expectStatus];
      const ok = expectedStatuses.includes(res.status);

      let body = null;
      const text = await res.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (t.expectBody && ok && body) {
        const bodyOk = t.expectBody(body);
        if (!bodyOk) {
          console.log("FAIL:", t.name);
          console.log("  Status:", res.status, "(expected body check failed)");
          console.log("  Body:", JSON.stringify(body).slice(0, 200));
          failed++;
          continue;
        }
      }

      if (ok) {
        console.log("PASS:", t.name, "→", res.status);
        passed++;
      } else {
        console.log("FAIL:", t.name);
        console.log("  Status:", res.status, "(expected", expectedStatuses.join(" or ") + ")");
        if (body) console.log("  Body:", JSON.stringify(body).slice(0, 200));
        failed++;
      }
    } catch (err) {
      console.log("FAIL:", t.name);
      console.log("  Error:", err.message);
      failed++;
    }
  }

  console.log("");
  console.log("---");
  console.log("Result:", passed, "passed,", failed, "failed");
  if (failed > 0) {
    console.log("");
    console.log("Note: 500 from deployed backend usually means env on Render (DATABASE_URL, CLERK_SECRET_KEY).");
    console.log("See ENDPOINTS_AUDIT.md section 4 (Troubleshooting).");
  }
  process.exit(failed > 0 ? 1 : 0);
}

run();
