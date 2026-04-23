async function test() {
  const url = 'http://localhost:3000/api/store/products/denim-mini-skirt';
  const res = await fetch(url);
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

test();
