# SunnyPlays — Music Catalog Insights Platform

A full-stack app for building a personal album library from the public iTunes
catalog, then exploring it through analytics and AI-generated insights.

- **Backend:** Java 17 / Spring Boot 3, PostgreSQL, JWT auth
- **Frontend:** Next.js 14 (App Router) / TypeScript / Tailwind
- **Third-party API:** [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) (no key required)

---

## 1. Entity choice: Albums

The assignment asks for one focus among Albums / Songs / Artists. I picked
**Albums**, for three reasons:

1. **Richest analytics surface.** Albums carry `genre`, `releaseDate`,
   `trackCount`, and `price` in a single iTunes response — enough to build all
   six analytics views the spec asks for (genre pie, releases-by-year line,
   track-count histogram, top-artist bar, rating bar) without a second API call
   per item. Songs would need an extra lookup for album-level metadata like
   track count; Artists don't carry price or release-date data at all.
2. **Natural unit for a personal "library."** People think in terms of "albums
   I own/love," which maps cleanly to a ratings + notes model.
3. **Stable identifiers.** `collectionId` is a solid, unique key for
   dedup ("already in your library") without extra normalization logic.

The trade-off: a user who only likes one song off an album still has to save
the whole album. That felt like the right trade for analytics depth over
song-level granularity.

## 2. Database & schema

PostgreSQL, via Spring Data JPA (`ddl-auto: update`, so the schema below is
generated automatically on first run — no manual migration step needed for
this assignment's scope).

**`users`**
| column | type | notes |
|---|---|---|
| id | bigint (PK) | |
| username | varchar(50) | unique |
| email | varchar(120) | unique |
| password_hash | varchar | BCrypt |
| created_at | timestamp | |

**`library_items`** (the per-user saved albums)
| column | type | notes |
|---|---|---|
| id | bigint (PK) | |
| user_id | bigint (FK → users) | |
| apple_catalog_id | bigint | iTunes `collectionId` |
| title | varchar | |
| artist_name | varchar | |
| genre | varchar | nullable |
| release_date | date | nullable |
| track_count | int | nullable |
| artwork_url | varchar(500) | nullable |
| price | double | nullable |
| user_rating | int | 1–5, nullable |
| user_notes | varchar(2000) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

`(user_id, apple_catalog_id)` has a unique constraint, so a user can't save
the same album twice — the API returns `409 Conflict` instead.

**Why SQL over NoSQL:** the data is small, relational (one user → many library
items), and every analytics query is a `GROUP BY`/aggregate over that
relationship — exactly what Postgres is built for. A document store would add
complexity (denormalizing user info onto each item, or a second query) with no
upside at this scale.

## 3. AI feature: Trend Summary + genre recommendations

Endpoint: `GET /api/insights`.

The stats (dominant genre, average release year, rating pattern, genre
diversity) are always computed **deterministically** from the user's own
library — the feature works with zero configuration. Those stats are then
either:
- phrased into 2 sentences by **Claude** (Anthropic Messages API), if
  `ANTHROPIC_API_KEY` is set, or
- assembled from a template, if it isn't.

Recommendations use a small hand-curated "adjacent genre" map (e.g. Jazz →
Blues, R&B/Soul) filtered against genres the user doesn't already have, so
they always suggest something new.

**Why this design:** a real LLM call is genuinely useful for the "narrated
summary" but shouldn't be a hard dependency for a take-home reviewer running
this locally without an API key — so the analysis layer is separated from the
prose layer, and only the prose layer optionally calls out to Claude. The
response includes a `generatedBy: "heuristic" | "llm"` field so the frontend
(and a reviewer) can see which path was taken.

## 4. API

All routes except `/api/auth/**` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Returns a JWT |
| GET | `/api/search?query=&type=album&limit=25` | Proxies the iTunes Search API |
| GET | `/api/library?page=&size=` | Paginated list of the user's saved albums |
| POST | `/api/library` | Save an album |
| PUT | `/api/library/{id}` | Update rating and/or notes |
| DELETE | `/api/library/{id}` | Remove an album |
| GET | `/api/analytics` | Aggregated stats for the 5 charts |
| GET | `/api/insights` | AI trend summary + recommendations |

Validation errors return `400` with a field-level `details` array; not-found
returns `404`; duplicates return `409`; upstream iTunes failures return `502` —
all via a single `@RestControllerAdvice` (`GlobalExceptionHandler`), so error
shape is consistent everywhere.

## 5. Running it locally

**Backend + Postgres (Docker):**
```bash
docker compose up --build
# backend now on http://localhost:8080
```

**Backend without Docker** (needs local Postgres):
```bash
cd backend
mvn spring-boot:run
```
Or point it at an in-memory H2 database for a zero-setup try:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL if not localhost:8080
npm install
npm run dev
# http://localhost:3000
```

## 6. Deployment

**Frontend → Vercel**
1. Push this repo to GitHub.
2. Import it in Vercel, set the project root to `frontend/`.
3. Add an environment variable `NEXT_PUBLIC_API_BASE_URL` pointing at your
   deployed backend URL (see below).
4. Deploy. Vercel builds Next.js natively — no config needed beyond that env var.

**Backend → Render / Railway** (Vercel doesn't run long-lived JVM services, so
the backend needs a separate host)
1. Create a new Web Service from the same repo, root `backend/`.
2. It auto-detects the `Dockerfile`, or you can build with
   `mvn clean package` / run `java -jar target/*.jar`.
3. Add a managed Postgres instance (both platforms offer one) and set:
   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
   - `JWT_SECRET` (any long random string)
   - `ALLOWED_ORIGINS` = your Vercel frontend URL
   - `ANTHROPIC_API_KEY` (optional, enables LLM-narrated insights)
4. Redeploy the frontend (or just update its env var) once you have the
   backend's live URL.

## 7. Trade-offs & what I'd do with more time

- **JWT in `localStorage`, not httpOnly cookies.** Simpler for a 3-day
  assignment and fine for a demo; a production app should move to httpOnly
  cookies to reduce XSS exposure.
- **No caching layer** for repeated iTunes searches — the API's own ~20
  req/min limit is generous enough for a single-user demo, but a real product
  would cache popular queries (Redis, or even an in-memory TTL cache).
- **`ddl-auto: update`** instead of versioned migrations (Flyway/Liquibase) —
  fine here, not what I'd ship to production.
- **Rating-based "recommendations"** use a static adjacency map rather than
  real collaborative filtering, since there's only ever one user's data to
  learn from in this schema. With multi-user data, a real recommender
  (co-occurrence across users' libraries) would be the natural next step.
- **Pagination** is implemented on `GET /api/library`; the frontend currently
  requests up to 200 at once for simplicity on the library/analytics pages
  rather than building infinite scroll — reasonable at personal-library scale,
  not at library-of-thousands scale.
