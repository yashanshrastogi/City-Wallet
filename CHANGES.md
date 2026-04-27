# City Wallet — Complete Fix & Upgrade Changelog

## 🐛 Bug Fixes (8 categories, 16 individual bugs)

### BUG-1: contextEnrichment/main.py — 4 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | startup | `os.environ["GOOGLE_CREDENTIALS_PATH"]` is ignored by GCP SDK | Changed to `GOOGLE_APPLICATION_CREDENTIALS` |
| 2 | geocoding | `res[0].get(...)` — `res` is a `requests.Response`, not a list | Changed to `res.json()["results"][0].get(...)` |
| 3 | weather | `wea.get("temperature")` — same issue, Response ≠ dict | Changed to `wea.json()["current_weather"]["temperature"]` |
| 4 | publish | `"temperature": tmp` — `tmp` is undefined (NameError) | Changed to `temp` (the correct variable) |

### BUG-2: contextEnrichment/utils/get_imp.py — 1 bug
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | return | `is_holiday` used before assignment (NameError at runtime) | Added `is_holiday = formatted_date in de_holidays` |

### BUG-3: aggregator/main.py — 3 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | startup | `GOOGLE_CREDENTIALS_PATH` env var — ignored by GCP | Changed to `GOOGLE_APPLICATION_CREDENTIALS` |
| 2 | Redis | `password=int(os.getenv("REDIS_PASSWORD"))` — crashes when env is None + int() is wrong type | Changed to `password=os.getenv("REDIS_PASSWORD") or None` |
| 3 | Redis | Missing `port=` parameter in Redis init | Added `port=int(os.getenv("REDIS_PORT", 6379))` |

### BUG-4: llmService/main.py — 3 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | top | `import base64` missing — used in `/final` endpoint (ImportError) | Added `import base64` |
| 2 | exception | `HttpExcpetion` — typo, NameError at runtime | Fixed to `HTTPException` |
| 3 | startup | `os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred` with no null guard — crashes on missing env | Added `if cred:` guard |

### BUG-5: backend/settings.py — 2 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | line 14 | `SECRET_KEY` hardcoded in source — critical security risk | Moved to `os.getenv("DJANGO_SECRET_KEY")` |
| 2 | line 18 | `DEBUG = True` hardcoded — production risk (exposes stack traces) | Changed to `os.getenv("DEBUG", "False").lower() == "true"` |

### BUG-6: backend/api.py — 2 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | — | `GET /offers/{task_id}` endpoint completely missing — frontend polls it every 1.5s | Added the endpoint, reading from Redis `offer:{task_id}` key |
| 2 | publish | `publisher.publish()` called with no guard when `publisher is None` | Wrapped in `_publish()` helper with None check |

### BUG-7: dashboard/layout.tsx — 1 bug
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | fetch | `Authorization: Bearer ${session.accessToken}` — Django backend verifies Google **ID tokens**, not OAuth access tokens | Changed to `session.idToken` (the correct credential) |

### BUG-8: docker-compose.yml — 2 bugs
| # | Line | Bug | Fix |
|---|------|-----|-----|
| 1 | — | `aggregator` service entirely missing — it's built and referenced but never run | Added complete `aggregator` service definition |
| 2 | redis | Custom redis build with no `healthcheck` — backend starts before redis is ready | Switched to `redis:7-alpine`, added healthcheck + `condition: service_healthy` |

---

## ✨ Enhancements & New Features

### Frontend
- **New font pairing**: Syne (display) + DM Sans (body) — replaced Inter for a more distinctive, premium feel
- **Enhanced color system**: Richer palette with tertiary accent, better contrast ratios
- **Dashboard overview**: Added weekly activity bar chart with animated bars, improved stat cards with contextual badges
- **Discover page**: Added progress bar during offer generation, copy-to-clipboard for discount codes, expanded quick-intent chips, visual urgency badges
- **Mobile responsive**: Hamburger menu, mobile header, responsive grid breakpoints
- **Grid overlay & ambient gradients**: Subtle depth effect on background
- **Loader improvement**: Replaced pulse animation with spinner ring
- **Toast-ready CSS**: `.toast-wrap`, `.toast-success`, `.toast-error` classes added

### Backend
- `GET /offers/{task_id}` — new polling endpoint stores results under `offer:{task_id}` key in Redis (5-min TTL)
- LLM service now stores offer with `task_id` key for per-request retrieval
- `_publish()` helper wraps all PubSub calls with None guard (safe in local dev without GCP credentials)
- Settings now support `DATABASE_URL` for Postgres in production

### Docker
- Added `aggregator` service to compose
- Redis uses official `redis:7-alpine` image with healthcheck
- All service dependencies use `condition: service_healthy`
- Environment variables properly documented in `.env.example`
- Missing `Dockerfiles` and `requirements.txt` created for all services
