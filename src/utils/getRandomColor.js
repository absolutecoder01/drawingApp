const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
