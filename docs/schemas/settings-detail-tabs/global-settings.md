# Settings - Global Settings Tab

**Tab**: Global Settings

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Global System Settings                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  General Settings                                           │
│                                                             │
│  Site Name: [Statsboard               ] [Save]             │
│  Default Season: [2024                ▼]                     │
│  Timezone: [UTC                    ▼]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Registration Settings                                      │
│                                                             │
│  Allow Public Registration: [✓] [Save]                     │
│  Require Email Verification: [✓] [Save]                     │
│  Default User Role: [User          ▼]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Email Settings                                             │
│                                                             │
│  SMTP Server: [smtp.example.com       ] [Save]             │
│  SMTP Port: [587                     ] [Save]               │
│  SMTP Username: [noreply@example.com    ] [Save]            │
│  SMTP Password: [••••••••••••••••••••] [Save]             │
│  Sender Email: [noreply@example.com    ] [Save]            │
│  Sender Name: [Statsboard            ] [Save]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Storage Settings                                           │
│                                                             │
│  Max File Upload Size (MB): [10    ] [Save]                 │
│  Allowed Image Formats: [JPG, PNG, WEBP  ] [Save]         │
│  Static Files Path: [/var/www/static    ] [Save]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  API Settings                                               │
│                                                             │
│  Rate Limit (requests/min): [100   ] [Save]                 │
│  API Version: [v1               ▼]                          │
│  Enable API Documentation: [✓] [Save]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- **General Settings:**
  - Site name text input with save button
  - Default season dropdown selector with save button
  - Timezone dropdown selector with save button

- **Registration Settings:**
  - Allow public registration checkbox with save button
  - Require email verification checkbox with save button
  - Default user role dropdown selector with save button

- **Email Settings:**
  - SMTP server text input with save button
  - SMTP port text input with save button
  - SMTP username text input with save button
  - SMTP password text input (masked) with save button
  - Sender email text input with save button
  - Sender name text input with save button

- **Storage Settings:**
  - Max file upload size number input with save button
  - Allowed image formats text input with save button
  - Static files path text input with save button

- **API Settings:**
  - Rate limit number input with save button
  - API version dropdown selector with save button
  - Enable API documentation checkbox with save button

- Each setting has its own save button for immediate feedback
- Save operations show success/error alerts

## What we need from backend

**For getting global settings:**
- Site name
- Default season id
- Timezone
- Allow public registration
- Require email verification
- Default user role
- SMTP server
- SMTP port
- SMTP username
- SMTP password (hashed/encrypted)
- Sender email
- Sender name
- Max file upload size
- Allowed image formats
- Static files path
- Rate limit
- API version
- Enable API documentation
- [Interface: `GlobalSettings`](../../../src/app/features/settings/models/global-settings.model.ts)
- [Backend Schema: `GlobalSettingsSchema`](../../../../statsboards-backend/src/settings/schemas.py)
- **Backend API Endpoint:** `GET /api/settings/global`

**For updating individual settings:**
- Setting key and value
- [Interface: `SettingUpdate`](../../../src/app/features/settings/models/setting.model.ts)
- [Backend Schema: `SettingUpdateSchema`](../../../../statsboards-backend/src/settings/schemas.py)
- **Backend API Endpoint:** `PATCH /api/settings/global/{setting_key}`

**For seasons dropdown:**
- Season id
- Season year
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/`
