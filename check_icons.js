const l = require('lucide-react');
const icons = Object.keys(l).filter(k => k[0] === k[0].toUpperCase() && typeof l[k] === 'object');
const social = icons.filter(i => /facebook|twitter|tiktok|pinterest|instagram|globe|share|link/i.test(i));
console.log(social.sort().join('\n'));
