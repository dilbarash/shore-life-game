const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Database connection
mongoose.connect('mongodb://localhost:27017/shoreLife', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema and Model
const participantSchema = new mongoose.Schema({
  name: String,
  points: { type: Number, default: 0 },
});
const Participant = mongoose.model('Participant', participantSchema);

// Routes
app.get('/', async (req, res) => {
  const participants = await Participant.find().sort({ points: -1 });
  res.render('index', { participants });
});

app.post('/add', async (req, res) => {
  const { name } = req.body;
  await Participant.create({ name });
  res.redirect('/');
});

app.post('/update', async (req, res) => {
  const { id, points } = req.body;
  await Participant.findByIdAndUpdate(id, { $inc: { points: parseInt(points) } });
  res.redirect('/');
});

// Real-time leaderboard
io.on('connection', (socket) => {
  socket.on('updateLeaderboard', async () => {
    const participants = await Participant.find().sort({ points: -1 });
    io.emit('refreshLeaderboard', participants);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
