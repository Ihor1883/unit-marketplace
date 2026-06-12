const fs = require('fs');
const path = require('path');

// Получаем текст для поиска из консоли
const searchTerm = process.argv[2];
// Ищем только в папках app и components (самые частые места в Next.js)
const targetDirs = ['./app', './components']; 

if (!searchTerm) {
  console.log('❌ Ошибка: Укажи текст для поиска!');
  console.log('👉 Пример использования: node search.js "UNIT Marketplace"');
  process.exit(1);
}

console.log(`\n🔍 Ищу "${searchTerm}"...\n`);
let foundCount = 0;

function searchInDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchInDirectory(filePath); // Идем вглубь папок
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(searchTerm)) {
        foundCount++;
        console.log(`\n📁 Файл: \x1b[36m${filePath}\x1b[0m`); // Голубой цвет для пути
        
        // Находим точные номера строк
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(searchTerm)) {
            console.log(`   Строка ${index + 1}: \x1b[33m${line.trim()}\x1b[0m`); // Желтый цвет для кода
          }
        });
      }
    }
  });
}

// Запускаем поиск по нужным папкам
targetDirs.forEach(dir => searchInDirectory(dir));

if (foundCount === 0) {
  console.log('Ничего не найдено. 🤷‍♂️');
} else {
  console.log(`\n✅ Поиск завершен. Найдено совпадений в ${foundCount} файле(ах).`);
}