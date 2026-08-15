const fs = require('fs');
const path = require('path');
require('dotenv').config();
// also load atlas-credentials.env from project root if present
const altEnv = path.resolve(__dirname, '..', 'atlas-credentials.env');
if(fs.existsSync(altEnv)){
  require('dotenv').config({ path: altEnv });
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Template = require('./models/Template');

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
// allow CORS in dev; tighten in production
if(process.env.NODE_ENV !== 'production'){
  app.use(cors());
} else {
  // in production, serve only our own client
  app.use(cors({ origin: false }));
}

function getMongoUri(){
  // prefer explicit MONGODB_URI (Atlas onboarding), then MONGO_URI
  const raw = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
  if(raw){
    // strip accidental surrounding quotes
    const r = raw.replace(/^"|"$/g, '');
    // sanitize: if URI contains user:pass@, ensure password is percent-encoded
    const m = r.match(/^(mongodb(?:\+srv)?):\/\/([^:]+):([^@]+)@(.*)$/);
    if(m){
      const proto = m[1];
      const user = m[2];
      const pass = m[3];
      const rest = m[4];
      const enc = encodeURIComponent(pass);
      return `${proto}://${user}:${enc}@${rest}`;
    }
    return r;
  }

  // build from username/password if available
  const user = process.env.MONGODB_USERNAME || process.env.MONGO_USER;
  const pass = process.env.MONGODB_PASSWORD || process.env.MONGO_PASS;
  const host = process.env.MONGODB_HOST || '127.0.0.1:27017';
  const db = process.env.MONGODB_DB || 'photobooth';
  if(user && pass){
    const enc = encodeURIComponent(pass);
    // assume Atlas when host looks like mongodb.net
    if(host.includes('mongodb.net')){
      return `mongodb+srv://${user}:${enc}@${host}/${db}?retryWrites=true&w=majority`;
    }
    return `mongodb://${user}:${enc}@${host}/${db}`;
  }

  return 'mongodb://127.0.0.1:27017/photobooth';
}

const MONGO_URI = getMongoUri();

function maskUri(uri){
  try{
    return uri.replace(/:\/\/(.*?):(.*?)@/, (m, user, pass) => `://${user}:****@`);
  }catch(e){ return '***masked***' }
}

async function start(){
  try{
    console.log('ENV preview: MONGODB_URI set?', process.env.MONGODB_URI? 'yes':'no', ' MONGODB_USERNAME?', process.env.MONGODB_USERNAME? 'yes':'no');
    console.log('Connecting to MongoDB:', maskUri(MONGO_URI));
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Serve client static files in production
    if(process.env.NODE_ENV === 'production'){
      const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
      if(require('fs').existsSync(clientDist)){
        app.use(express.static(clientDist));
        app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
      } else {
        console.warn('Production build not found at', clientDist);
      }
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  }catch(err){
    console.error('Mongo connection error', err);
    process.exitCode = 1;
  }
}

start();

app.get('/api/templates', async (req, res) => {
  try {
    const templates = await Template.find().lean().exec();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// server is started after DB connection in start()
