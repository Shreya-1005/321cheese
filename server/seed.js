const fs = require('fs');
const path = require('path');
require('dotenv').config();
// also load atlas-credentials.env if present at repo root
const altEnv = path.resolve(__dirname, '..', 'atlas-credentials.env');
if(fs.existsSync(altEnv)){
  require('dotenv').config({ path: altEnv });
}
const mongoose = require('mongoose');
const Template = require('./models/Template');

function resolveMongoUri(){
  const raw = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL;
  if(raw){
    const r = raw.replace(/^"|"$/g, '');
    const m = r.match(/^(mongodb(?:\+srv)?):\/\/([^:]+):([^@]+)@(.*)$/);
    if(m){
      const proto = m[1];
      const user = m[2];
      const pass = encodeURIComponent(m[3]);
      const rest = m[4];
      return `${proto}://${user}:${pass}@${rest}`;
    }
    return r;
  }

  const user = process.env.MONGODB_USERNAME || process.env.MONGO_USER;
  const pass = process.env.MONGODB_PASSWORD || process.env.MONGO_PASS;
  const host = process.env.MONGODB_HOST || '127.0.0.1:27017';
  const db = process.env.MONGODB_DB || 'photobooth';
  if(user && pass){
    const enc = encodeURIComponent(pass);
    if(host.includes('mongodb.net')){
      return `mongodb+srv://${user}:${enc}@${host}/${db}?retryWrites=true&w=majority`;
    }
    return `mongodb://${user}:${enc}@${host}/${db}`;
  }

  return 'mongodb://127.0.0.1:27017/photobooth';
}

const MONGO_URI = resolveMongoUri();

const templates = [
  {
    name: 'Pastel Peach',
    frameColor: '#FFDAD1',
    backgroundGradient: 'linear-gradient(135deg,#FFF0F0,#FFEBD6)',
    stickerSet: ['🍓','🌸','💖','✨'],
    layout: { padding: 24, slotHeight: 280 }
  },
  {
    name: 'Minty Blue',
    frameColor: '#DFF7F0',
    backgroundGradient: 'linear-gradient(135deg,#E8FFF8,#DFF7FF)',
    stickerSet: ['☁️','🪩','🧸','🌈'],
    layout: { padding: 20, slotHeight: 260 }
  },
  {
    name: 'Lavender',
    frameColor: '#F3E8FF',
    backgroundGradient: 'linear-gradient(135deg,#F8F0FF,#F3E8FF)',
    stickerSet: ['💐','🦋','🌙','🍬'],
    layout: { padding: 22, slotHeight: 270 }
  }
];

async function seed(){
  console.log('Seeding using URI:', MONGO_URI.replace(/:\/\/(.*?):(.*?)@/, (m,u,p)=>`://${u}:****@`));
  await mongoose.connect(MONGO_URI);
  console.log('Connected for seed');
  await Template.deleteMany({});
  await Template.insertMany(templates);
  console.log('Seeded templates');
  await mongoose.disconnect();
}

seed().catch(err=>{
  console.error(err);
});
