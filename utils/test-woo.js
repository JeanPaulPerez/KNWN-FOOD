
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testWooConnection() {
    const url = process.env.VITE_WC_URL;
    const ck = process.env.VITE_WC_CONSUMER_KEY;
    const cs = process.env.VITE_WC_CONSUMER_SECRET;

    console.log('🔍 Probando acceso a Productos (Método más común)...');

    if (!url || !ck || !cs) {
        console.error('❌ Error: Faltan credenciales');
        return;
    }

    try {
        const testUrl = `${url}/wp-json/wc/v3/products?consumer_key=${ck}&consumer_secret=${cs}&per_page=1`;
        const res = await fetch(testUrl);

        if (res.ok) {
            const data = await res.json();
            console.log('✅ REST API: ¡CONECTADO! He podido leer los productos.');
            console.log(`📦 Primer producto encontrado: ${data[0]?.name || 'Ninguno (pero la conexión funciona)'}`);
        } else {
            const error = await res.json();
            console.error('❌ REST API: Fallo de autorización.', error.message || '');
            console.log('💡 Sugerencia: Verifica que las claves pertenezcan a un usuario Administrador y tengan permiso de Escritura.');
        }
    } catch (e) {
        console.error('❌ Error de red:', e.message);
    }
}

testWooConnection();
