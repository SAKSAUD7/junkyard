# JYNM Sell Vehicle (Android + iOS)

Standalone Expo/React Native + TypeScript client for the existing JYNM Sell Your Vehicle workflow. The app has no backend, database, or lead-management service of its own. Removing this directory removes only the mobile source project; it does not affect JYNM web, Django, its database, or the admin portal.

## Verified integration contract

Inspected in this repository:

- Web form: `frontend/src/pages/SellYourCar.jsx`
- API client method: `frontend/src/services/api.js` (`sellVehicle`)
- Django route: `backend/core/urls.py` includes `apps.leads.urls` at `/api/sell-your-car/`
- Submission endpoint: `POST /api/sell-your-car/` (public create; admin-only list/update/delete)
- Serializer/model: `backend/apps/leads/serializers.py` and `backend/apps/leads/models.py`
- Admin workflow: `backend/apps/leads/admin.py` and the existing admin portal's Sell Vehicle Leads page
- Health endpoint: `GET /api/health/`

The request sends only fields accepted by the existing `VehicleSubmissionSerializer`: `vin`, `year`, `make`, `model`, `trim`, `mileage`, vehicle-condition booleans, `body_damage`, seller `name`, `email`, `phone`, `zip_code`, `state`, `city`, and `description`. A successful response contains the created record, including its id/status/timestamp. Django persists it to the existing vehicle submission table and creates the existing admin notification; the mobile project does not create or access a database.

**Images are intentionally not included.** The inspected model and serializer expose no image fields or upload endpoint for vehicle submissions. Adding upload UI without a confirmed storage/request contract would fabricate functionality. Camera/gallery permissions are consequently not requested.

## Requirements and setup

- Node.js 20.19.4 or newer (Expo SDK 54 requirement)
- npm
- Android: Android Studio/SDK and a configured emulator/device for native builds
- iOS: macOS with Xcode for native simulator/device builds (this checkout is on Linux and cannot run Xcode)
- A running, reachable JYNM Django API

```sh
cd mobile-sell-vehicle
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` in `.env` to the reachable existing API root, including `/api` (for example, the HTTPS API hostname actually configured for your deployment, followed by `/api`). Do not use a guessed host or `localhost` on a physical device. For Android emulator development, use a host address reachable from that emulator; for physical devices, use a LAN/staging URL reachable by the device. Production requires HTTPS. This value is public application configuration, not a secret.

Then:

```sh
npm install
npm run typecheck
npm start
```

Use Expo's terminal menu or run `npm run android` on a machine with Android SDK setup. Run `npm run ios` on macOS with Xcode. No signing credentials are included.

## Backend development availability

The API was not running on the inspected workstation. The API probes to `127.0.0.1:8000` failed, `backend/.env` was absent, and the inspected `backend/venv` does not contain Django. The inspected deployed API health endpoint also returned HTTP 503 with a database health failure while its cache check was healthy; this means the HTTP app is reachable but database-dependent features are not ready. Ask the server operator to verify database service status, database host/name, credentials, network access, and backend logs in hPanel before changing configuration. Do not run production migrations as a generic availability fix. Start the local backend only after installing `backend/requirements.txt` in a Python environment and configuring the required environment (including `SECRET_KEY`, database settings, allowed hosts, and email settings as applicable). Verify the selected database target and backup before migrations. From `backend/`, local development commands are:

```sh
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Do not copy production secrets into this project. Verify readiness at `GET /api/health/`; its response checks the Django process, database, and cache. An HTTP server response alone is not enough if its health response reports a failed dependency.

## Behavior and safety notes

- The app posts to the existing public vehicle submission endpoint and does not attach an authorization token.
- It uses the same field names and data model as the web form and reports Django validation/network errors.
- A synchronous client lock prevents double taps while a request is in flight. The existing endpoint does not advertise an idempotency-key contract, so the app does not automatically retry an ambiguous failed submission; confirm whether a lead was created before manually resubmitting after a timeout.
- The form does not persist personal details locally and does not log submissions or contact data.
- The app does not claim to prove the record is visible in a deployed admin portal. Verify end-to-end using a development/staging API and its matching admin portal.
- No camera, gallery, location, or notification permissions are requested.

## Checks

```sh
npm run typecheck
```

There are no mobile unit/e2e tests configured yet. Native Android and iOS builds require the respective platform toolchains; web/backend build commands do not validate native binaries.
