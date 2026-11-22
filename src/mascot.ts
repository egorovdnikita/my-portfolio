const mascots = ['Circle', 'Arch', 'Briefcase', 'Cat', 'Cloud', 'Clover', 'Drop', 'Flame', 'Flower', 'Ghost', 'Heart', 'Hexagon', 'Oval', 'Pill', 'Scallop', 'Square', 'Star', 'Triangle'];

function chooseMascot() {
  try {
    const key = 'portfolio-mascot';
    const previous = sessionStorage.getItem(key);
    const available = mascots.filter(mascot => mascot !== previous);
    const next = previous ? available[Math.floor(Math.random() * available.length)] : 'Circle';
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return mascots[Math.floor(Math.random() * mascots.length)];
  }
}

// Выбираем один раз при загрузке страницы, а не при открытии и закрытии кейсов.
const mascot = chooseMascot();
export const mascotAvatar = `${import.meta.env.BASE_URL}assets/mascots/${mascot.toLowerCase()}-thinking.webp`;
