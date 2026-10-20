# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Kyyros is a video platform where comments can be pinned to a moment in the video. Timestamped comments show up as markers on the progress bar, and each one starts a thread. It's a monorepo with two independently deployed apps:

- `backend/`: Spring Boot 4 / Java 25 REST API (deployed to Render via `backend/Dockerfile`)
- `frontend/`: Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui (deployed to Vercel)
- `supabase/`: SQL that must be applied manually in Supabase (e.g. the `auth.users` → `public.users` trigger)

`frontend/CLAUDE.md` (via `frontend/AGENTS.md`) warns that this Next.js version has breaking changes from older versions. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing Next.js code. For example, middleware lives in `src/proxy.ts` and exports `proxy`, not `middleware`.

## Commands

Backend (run from `backend/`; use `mvnw.cmd` on Windows):
```bash
./mvnw spring-boot:run                       # run API on :8080 (PORT env overrides)
./mvnw test                                  # all tests
./mvnw test -Dtest=KyyrosApplicationTests    # single test class (append #method for one method)
./mvnw clean package -DskipTests             # build jar
```
Config comes from env vars, optionally loaded from `backend/.env.properties` (gitignored): `SUPABASE_DATABASE_URL`, `SUPABASE_JWKS_URL`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `MUX_TOKEN_ID`, `MUX_SECRET_KEY`, `MUX_WEBHOOK_SECRET`. The only test is the context-load smoke test, which needs real config to pass.

Frontend (run from `frontend/`):
```bash
npm run dev      # :3000
npm run build
npm run lint     # eslint (next core-web-vitals + typescript)
```
There is no frontend test runner. Env lives in `frontend/.env.local`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Add shadcn components with `npx shadcn add <name>` (they go in `src/components/ui`).

## Architecture

### Auth: Supabase issues tokens, Spring verifies them
- The frontend handles all sign-in/sign-up flows with Supabase (`@supabase/ssr`). `src/proxy.ts` refreshes the session cookie on every request. Use `lib/supabase/client.ts` in the browser and `lib/supabase/server.ts` in RSCs and server actions.
- `lib/api/fetcher.ts` (`apiFetch`) is the single way to call the backend. It attaches the Supabase access token as `Bearer`, throws `RateLimitError` on 429, and returns `null` on 204. Pass `{ requireAuth: false }` for public GETs.
- The backend has no shared secret. `JwtAuthFilter` verifies ES256 tokens against Supabase's JWKS (audience `authenticated`) and sets the principal to the user UUID string. Controllers read it with `@AuthenticationPrincipal String userId` and pass `UUID.fromString(userId)` to services.
- `SecurityConfig` leaves `GET /api/v1/videos/**`, `GET /api/v1/comments/**`, and `POST /api/v1/webhooks/**` public. Everything else requires auth. When you add an endpoint, check whether it falls under one of these public patterns.
- `public.users` rows are created by the Supabase trigger in `supabase/triggers/`, not by the backend. Signup alone never creates a user row in the backend.

### Upload pipeline (spans both apps)
`hooks/use-video-upload.ts` runs this sequence:
1. `POST /api/v1/videos` → `VideoService.initiateUpload` creates a `PENDING` video and returns a presigned S3 PUT URL.
2. The browser PUTs the file straight to S3 (`lib/upload/s3.ts`), sending the `x-amz-tagging: pending=true` header. An S3 lifecycle rule deletes objects that are still tagged, which cleans up abandoned uploads.
3. `PATCH /api/v1/videos/{id}/status` with `UPLOADED` → the backend checks that the object exists and its size is within 1KB–2GB, creates a Mux asset from a presigned GET URL, sets status to `PROCESSING`, and removes the pending tag.
4. Mux calls `POST /api/v1/webhooks/mux`. The handler verifies the HMAC signature (`MuxSignatureVerifier`, raw body), then `video.asset.ready` sets `READY` and the playback ID, and `video.asset.errored` sets `FAILED`.
5. The frontend polls `GET /videos/{id}` until the status is `READY` or `FAILED`.

`VideoStatus` is duplicated in `enums/VideoStatus.java` and `lib/api/videos.ts`. Keep the two in sync. Thumbnails and playback come from `image.mux.com` / Mux playback IDs.

### Comments
- A `Comment` with a null `parentComment` is a root comment. Nesting is limited to one level: replying to a reply is rejected. Only root comments store `timestampSeconds`. Responses give replies their parent's timestamp as `effectiveTimestamp`, which is how threads attach to a marker.
- `GET /videos/{id}/comments` returns root comments with replies nested, loaded with a fetch-join query (`findCommentByVideoIdWithRepliesAndUsers`) to avoid N+1.
- On the frontend, `contexts/comments-context.tsx` holds client-side comment state: optimistic add/delete, the derived `timestampedComments` list that drives the progress-bar markers, sidebar selection, and the draft timestamp. The video page (`app/videos/[id]/page.tsx`) is an RSC that fetches the video and comments, then hands off to `VideoPageClient`. Desktop and mobile have separate marker and comment-section components (`mobile-*`, `use-is-mobile`).

### Backend conventions
- Layering: controller → service (`@Transactional`, ownership checks) → Spring Data repository. Request and response DTOs are Java records in `dto/`. Entities use Lombok `@Getter/@Setter`, never `@Data`.
- Errors: throw the custom exceptions in `exception/` (`ResourceNotFoundException`, `BadRequestException`, `ForbiddenOperationException`, etc.). `GlobalExceptionHandler` maps them to `ErrorResponse` with the right status, and the 500 catch-all hides internal details. Add a handler there for any new exception type.
- Rate limiting: put `@RateLimit(name, capacity, periodSeconds)` on a controller method. `RateLimitAspect` enforces it per user with in-memory Bucket4j buckets and skips unauthenticated requests.
- The schema is managed by Hibernate `ddl-auto=update` (there are no migration files). Column names are explicit because the physical naming strategy is `PhysicalNamingStrategyStandardImpl`. `open-in-view` is off, so lazy associations must be loaded inside the service transaction (use fetch-join repository queries such as `findByIdWithUploader`).
- Spring Boot 4 uses Jackson 3 (`tools.jackson.databind`), not `com.fasterxml`.

## CI

`.github/workflows/claude-review.yml` runs a Claude PR review only when the PR has the `ai-review` label. The backend and frontend jobs are gated by which paths changed. Fill in `.github/pull_request_template.md` (Description / Screenshots / Docs) for PRs.
