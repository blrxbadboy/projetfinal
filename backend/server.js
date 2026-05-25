const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

//host w limit ll db 50mb
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],//lport te3y al 5173
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//connect ll db mongo db
mongoose.connect('mongodb://127.0.0.1:27017/freelanceTN')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Error:', err));

// shema #1 usershema kfh bch tbeen f mongodb
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
  cover: String,
  cin: String,
  cvName: String,
  experience: { type: String, default: "0" }
});
//#2 kfh bch tbeen document job kfh
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  client: String,
  budget: String,
  location: String,
  createdBy: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

//token verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log("🔑 Token received:", token ? token.substring(0, 40) + "..." : "NO TOKEN");

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token VALID for user:", decoded.email);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification FAILED:", err.message);
    return res.status(403).json({ message: "Token invalide" });
  }
};

//getting public routes ala hasb jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
//getting public routes ala hasb email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    const { password, ...profile } = user.toObject();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ====================== AUTH ROUTES ======================
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;//ta9ra data ly jeya ml frontend
    if (await User.findOne({ email })) {//testy idha email exist deja or not
      return res.status(400).json({ message: "Cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);//tcrypty l password bcrypt.hash
    const user = new User({ name, email, password: hashedPassword });//create user in mongodb
    await user.save();

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '24h' });//create token
    res.status(201).json({ token, name });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post('/api/login', async (req, res) => {//using api/login for autentification
  try {
    const { email, password } = req.body;//taking login data
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {//comparaison ll password f db
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    const token = jwt.sign({ email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });//create login token
    res.json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
//editing profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    Object.assign(user, req.body);
    await user.save();
    res.json({ message: "Profil mis à jour !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
//post a pub
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const { title, description, image, budget, location } = req.body;
    
    const job = new Job({
      title,
      description,
      image: image || "",
      client: req.user.name,
      budget: `${budget} TND`,
      location,
      createdBy: req.user.email
    });
    
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la publication" });
  }
});
//modification of pub
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.createdBy !== req.user.email) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    Object.assign(job, req.body);
    if (job.budget && !job.budget.includes("TND")) job.budget += " TND";
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
});

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.createdBy !== req.user.email) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    await job.deleteOne();
    res.json({ message: "Mission supprimée !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

//starting server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur Btala TN démarré sur http://localhost:${PORT}`);
});