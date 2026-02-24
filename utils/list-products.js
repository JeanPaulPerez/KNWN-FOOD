
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function listRealProducts() {
    const url = process.env.VITE_WC_URL;
    const ck = process.env.VITE_WC_CONSUMER_KEY;
    const cs = process.env.VITE_WC_CONSUMER_SECRET;

    try {
        const res = await fetch(`${url}/wp-json/wc/v3/products?consumer_key=${ck}&consumer_secret=${cs}&per_page=20&fields=id,name`);
        const products = await res.json();
        console.log('--- PRODUCTOS REALES EN TU WOOCOMMERCE ---');
        products.forEach(p => console.log(`ID: ${p.id} - Nombre: ${p.name}`));
        console.log('-------------------------------------------');
    } catch (e) {
        console.error('Error:', e.message);
    }
}
listRealProducts();
