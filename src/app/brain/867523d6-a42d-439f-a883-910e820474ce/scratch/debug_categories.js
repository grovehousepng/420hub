const https = require('https');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.WORDPRESS_URL;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

const url = `${WORDPRESS_URL}/wp-json/wc/v3/products/categories?consumer_key=${CK}&consumer_secret=${CS}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const categories = JSON.parse(data);
      console.log('Categories found:');
      categories.forEach(c => console.log(`- ${c.name} (slug: ${c.slug}, id: ${c.id})`));
    } catch (e) {
      console.log('Error parsing categories:', data);
    }
  });
}).on('error', (err) => {
  console.log('Error fetching categories:', err.message);
});
