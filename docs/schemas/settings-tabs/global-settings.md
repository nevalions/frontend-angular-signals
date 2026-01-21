# Settings - Global Settings Tab

**Tab**: Global Settings
**Parent**: [Settings](../settings.md)

```
┌─────────────────────────────────────────────────────────────┐
│                    General Settings                        │
├─────────────────────────────────────────────────────────────┤
│  Site Name              [Site Name              ] [Save]  │
│  Default Season        [2024        ▼]                    │
│  Timezone             [UTC                  ] [Save]      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Registration Settings                   │
├─────────────────────────────────────────────────────────────┤
│  [✓] Allow Public Registration                          │
│  [✓] Require Email Verification                          │
│  Default User Role      [viewer               ] [Save]   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Email Settings                          │
├─────────────────────────────────────────────────────────────┤
│  SMTP Server           [smtp.example.com      ] [Save]  │
│  SMTP Port            [587                  ] [Save]      │
│  SMTP Username         [admin                ] [Save]      │
│  SMTP Password         [••••••••             ] [Save]   │
│  Sender Email         [noreply@example.com   ] [Save]    │
│  Sender Name         [Statsboard           ] [Save]       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Storage Settings                        │
├─────────────────────────────────────────────────────────────┤
│  Max File Upload Size (MB) [10                   ] [Save]│
│  Allowed Image Formats   [jpg,png,webp         ] [Save]│
│  Static Files Path       [/var/www/static       ] [Save]   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    API Settings                           │
├─────────────────────────────────────────────────────────────┤
│  Rate Limit (requests/min) [60                   ] [Save]│
│  API Version               [v1                    ] [Save]│
│  [✓] Enable API Documentation                            │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

**General Settings Section:**
- Site Name (text input + Save button)
- Default Season (dropdown with seasons list)
- Timezone (text input + Save button)

**Registration Settings Section:**
- Allow Public Registration (checkbox)
- Require Email Verification (checkbox)
- Default User Role (text input + Save button)

**Email Settings Section:**
- SMTP Server (text input + Save button)
- SMTP Port (number input + Save button)
- SMTP Username (text input + Save button)
- SMTP Password (password input + Save button)
- Sender Email (email input + Save button)
- Sender Name (text input + Save button)

**Storage Settings Section:**
- Max File Upload Size (MB) (number input + Save button)
- Allowed Image Formats (text input + Save button)
- Static Files Path (text input + Save button)

**API Settings Section:**
- Rate Limit (requests/min) (number input + Save button)
- API Version (text input + Save button)
- Enable API Documentation (checkbox)

All settings are saved individually via their respective Save buttons.

## What we need from backend

**For loading all settings:**
- All global settings grouped by category
- [Interface: `GlobalSettingsGrouped`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `GlobalSettingsGroupedSchema`](../../../../statsboards-backend/src/global_settings/schemas.py)
- **Backend API Endpoint:** `GET /api/settings/grouped`

**For updating a setting:**
- Setting ID (from URL path)
- Update data (key, value, value_type, category, description - all optional)
- [Interface: `GlobalSettingUpdate`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `GlobalSettingSchemaUpdate`](../../../../statsboards-backend/src/global_settings/schemas.py)
- **Backend API Endpoint:** `PUT /api/settings/{id}/`

**For loading seasons dropdown:**
- List of all seasons
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/` (all seasons)

## Setting Keys

**General:**
- `site_name` (string) - Site name
- `default_season_id` (int) - Default season ID
- `timezone` (string) - Default timezone

**Registration:**
- `allow_public_registration` (bool) - Allow public user registration
- `require_email_verification` (bool) - Require email verification
- `default_user_role` (string) - Default role for new users

**Email:**
- `smtp_server` (string) - SMTP server hostname
- `smtp_port` (int) - SMTP server port
- `smtp_username` (string) - SMTP authentication username
- `smtp_password` (string) - SMTP authentication password
- `sender_email` (string) - Default sender email address
- `sender_name` (string) - Default sender name

**Storage:**
- `max_file_upload_size_mb` (int) - Maximum file upload size in MB
- `allowed_image_formats` (json) - Allowed image file formats array
- `static_files_path` (string) - Static files directory path

**API:**
- `rate_limit_per_minute` (int) - API rate limit per minute
- `api_version` (string) - Current API version
- `enable_api_documentation` (bool) - Enable/disable API docs

