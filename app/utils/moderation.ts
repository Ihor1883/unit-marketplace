// app/utils/moderation.ts

const BAD_WORDS = [
  "спам", "scam", "казино", "купить крипту", 
  "пидарас", "хуй", "блядь", "сука", "ебать", "хер", "пизда"
];

// Регулярное выражение для поиска ссылок и номеров телефонов
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(t\.me\/[^\s]+)|(\+?\d{10,12})/gi;

export const checkMessage = (text: string) => {
  const lowerText = text.toLowerCase();
  
  const containsBadWords = BAD_WORDS.some(word => lowerText.includes(word));
  const containsLinks = URL_REGEX.test(text);

  if (containsBadWords) return { isClean: false, reason: 'Нецензурная лексика' };
  if (containsLinks) return { isClean: false, reason: 'Подозрительная ссылка или контакт' };

  return { isClean: true, reason: '' };
};

export const censorText = (text: string) => {
  let censored = text;
  
  // Цензурим маты
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    censored = censored.replace(regex, "***");
  });
  
  // Цензурим ссылки
  censored = censored.replace(URL_REGEX, "[ссылка скрыта]");
  
  return censored;
};