const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/products.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Function to generate slug from title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

// Regex to find product objects
// We look for patterns like id: X, title: "..."
// We want to insert slug: "..." after title: "..."

const result = content.replace(/(id:\s*\d+,\s*title:\s*"([^"]+)")/g, (match, p1, p2) => {
  const slug = slugify(p2);
  return `${p1},\n    slug: "${slug}"`;
});

fs.writeFileSync(filePath, result);
console.log('Slugs added to products.ts');
