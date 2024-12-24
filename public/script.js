const socket = io();

socket.on('refreshLeaderboard', (participants) => {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = participants
    .map((p) => `<div><strong>${p.name}</strong>: ${p.points} points</div>`)
    .join('');
});

socket.emit('updateLeaderboard');
