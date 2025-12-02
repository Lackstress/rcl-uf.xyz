// Developer credentials - In production, use environment variables
// These are hashed for basic security (not production-grade)
const hashPassword = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const developers = [
  { username: 'locolopez', passwordHash: hashPassword('Lopeziscute32'), role: 'admin' },
  { username: 'mickeymouse', passwordHash: hashPassword('mickeyisweird'), role: 'admin' },
  { username: 'cova', passwordHash: hashPassword('covaisautism'), role: 'admin' },
  { username: 'lackstress', passwordHash: hashPassword('1234567'), role: 'owner' },
  { username: 'sumo', passwordHash: hashPassword('sumoisaballer'), role: 'admin' },
];

export const validateCredentials = (username, password) => {
  const user = developers.find(
    d => d.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return null;
  if (user.passwordHash === hashPassword(password)) {
    return { username: user.username, role: user.role };
  }
  return null;
};

export const AUTH_KEY = 'rcl_dev_session';
