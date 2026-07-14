const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Components to delete usages of entirely
  content = content.replace(/import KanjiStamp.*?\n/g, '');
  content = content.replace(/<KanjiStamp[^>]*>.*?<\/KanjiStamp>/gs, '');
  content = content.replace(/<KanjiStamp[^>]*\/>/gs, '');

  content = content.replace(/import ComicDivider.*?\n/g, '');
  content = content.replace(/<ComicDivider[^>]*>.*?<\/ComicDivider>/gs, '');
  content = content.replace(/<ComicDivider[^>]*\/>/gs, '');

  content = content.replace(/import SpeechBubble.*?\n/g, '');
  content = content.replace(/<SpeechBubble[^>]*>.*?<\/SpeechBubble>/gs, '');
  content = content.replace(/<SpeechBubble[^>]*\/>/gs, '');

  content = content.replace(/import \{?\s*StarburstBadge\s*\}?.*?\n/g, '');
  content = content.replace(/<StarburstBadge[^>]*>.*?<\/StarburstBadge>/gs, '');
  content = content.replace(/<StarburstBadge[^>]*\/>/gs, '');

  // Renames
  content = content.replace(/CartoonButton/g, 'Button');
  content = content.replace(/CartoonInput/g, 'Input');
  content = content.replace(/CartoonBadge/g, 'Badge');
  content = content.replace(/CartoonCard/g, 'Card');
  content = content.replace(/CartoonProgressBar/g, 'ProgressBar');
  content = content.replace(/CartoonCounter/g, 'QuantityStepper');
  content = content.replace(/@\/components\/ui\/QuantityStepper/g, '@/components/playshelf/QuantityStepper');
  content = content.replace(/CartoonStarRating/g, 'StarRating');
  content = content.replace(/@\/components\/ui\/StarRating/g, '@/components/playshelf/StarRating');
  content = content.replace(/CartoonProductCard/g, 'ProductCard');
  content = content.replace(/@\/components\/product\/ProductCard/g, '@/components/playshelf/ProductCard');
  
  content = content.replace(/useCartoonToast/g, 'useToast');
  content = content.replace(/@\/components\/ui\/Toast/g, '@/components/playshelf/Toast');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
