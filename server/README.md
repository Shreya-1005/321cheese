# Photobooth Server

Express API to serve template configs from MongoDB.

- Install: `npm install`
- Run server: `npm run dev` (requires `MONGO_URI` in `.env`)
- Seed templates: `npm run seed`

Endpoint:
- `GET /api/templates` - returns template configs
