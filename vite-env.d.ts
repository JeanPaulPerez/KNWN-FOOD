/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WC_URL: string;
    readonly VITE_WC_CONSUMER_KEY: string;
    readonly VITE_WC_CONSUMER_SECRET: string;
    readonly VITE_WC_STORE_URL: string;
    readonly VITE_WC_NONCE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
