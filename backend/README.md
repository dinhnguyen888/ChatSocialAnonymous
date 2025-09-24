# backendChatRealtime

this is my personal project for adding my CV 

Environment variables (.env):

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=change-me
CORS_ORIGINS=http://localhost:3000

# Mail (optional for OTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

Key configs are validated in `src/shared/config.ts`. Update `CORS_ORIGINS` as a comma-separated list for allowed web apps.