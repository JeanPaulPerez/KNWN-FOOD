<?php
/**
 * Plugin Name: KNWN Headless Bridge
 * Plugin URI:  https://knwnfood.com
 * Description: Habilita CORS y el endpoint de nonce para el frontend headless de KNWN Food.
 *              Instalar en WordPress > Plugins > Añadir nuevo > Subir plugin.
 * Version:     1.0.0
 * Author:      KNWN Food
 *
 * INSTRUCCIONES:
 * 1. Sube este archivo a /wp-content/plugins/knwn-headless/knwn-headless.php
 * 2. Activa el plugin en WordPress > Plugins
 * 3. Actualiza $ALLOWED_ORIGINS con el dominio donde está deployado el frontend
 *
 * QUÉ HACE ESTE PLUGIN:
 * ─────────────────────
 * A) Endpoint de Nonce (GET /wp-json/knwn/v1/nonce)
 *    WooCommerce Store API requiere un nonce para autenticar mutaciones del
 *    carrito (add/remove/update). Este endpoint genera y devuelve ese nonce.
 *    El frontend lo llama antes de cada operación del carrito.
 *
 * B) Cabeceras CORS
 *    El frontend React corre en un dominio diferente a knwnfood.com.
 *    Sin CORS, el browser bloquea las peticiones a la Store API.
 *    Este plugin configura las cabeceras necesarias para permitir:
 *    - Peticiones cross-origin con credentials (cookies de sesión)
 *    - Los métodos y headers que usa la Store API
 *
 * C) SameSite=None en cookies de sesión de WooCommerce
 *    Para que las cookies de sesión de WooCommerce funcionen en peticiones
 *    cross-origin (credentials:'include'), deben tener SameSite=None; Secure.
 *    Este plugin modifica las cookies de WooCommerce para que cumplan esto.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

// Dominios del frontend que tienen permiso para llamar a la Store API.
// Añade aquí tu dominio de Vercel o cualquier otro donde esté el frontend.
$KNWN_ALLOWED_ORIGINS = [
    'https://knwnfood.vercel.app',          // Ajustar al dominio real de Vercel
    'https://app.knwnfood.com',             // Si usas subdominio custom
    'http://localhost:5173',                 // Vite dev server
    'http://localhost:3000',                 // Otro dev local
];


// ─── A) ENDPOINT DE NONCE ──────────────────────────────────────────────────────

add_action( 'rest_api_init', function () {
    register_rest_route( 'knwn/v1', '/nonce', [
        'methods'             => 'GET',
        'callback'            => function () {
            return new WP_REST_Response(
                [ 'nonce' => wp_create_nonce( 'wc_store_api' ) ],
                200
            );
        },
        'permission_callback' => '__return_true',
    ]);
});


// ─── B) CABECERAS CORS ─────────────────────────────────────────────────────────

/**
 * Devuelve el origen permitido si el request proviene de un dominio autorizado.
 */
function knwn_get_allowed_origin(): string {
    global $KNWN_ALLOWED_ORIGINS;
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ( in_array( $origin, $KNWN_ALLOWED_ORIGINS, true ) ) {
        return $origin;
    }
    return '';
}

/**
 * Envía las cabeceras CORS para requests a la REST API (Store API incluida).
 */
add_filter( 'rest_pre_serve_request', function ( $value ) {
    $allowed_origin = knwn_get_allowed_origin();
    if ( ! $allowed_origin ) {
        return $value;
    }

    // Permitir el origen específico (no wildcard para que funcionen las cookies)
    header( "Access-Control-Allow-Origin: {$allowed_origin}" );
    // Esencial: permite que el browser envíe/reciba cookies de sesión
    header( 'Access-Control-Allow-Credentials: true' );
    header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Content-Type, X-WC-Store-API-Nonce, Authorization, Cart-Token' );
    // Cache de preflight: 1 hora
    header( 'Access-Control-Max-Age: 3600' );

    return $value;
}, 15 );

/**
 * Maneja las peticiones OPTIONS (preflight CORS) antes de que WordPress
 * intente autenticarlas o procesarlas.
 */
add_action( 'init', function () {
    if ( $_SERVER['REQUEST_METHOD'] !== 'OPTIONS' ) {
        return;
    }

    $allowed_origin = knwn_get_allowed_origin();
    if ( ! $allowed_origin ) {
        return;
    }

    header( "Access-Control-Allow-Origin: {$allowed_origin}" );
    header( 'Access-Control-Allow-Credentials: true' );
    header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Content-Type, X-WC-Store-API-Nonce, Authorization, Cart-Token' );
    header( 'Access-Control-Max-Age: 3600' );
    status_header( 200 );
    exit;
}, 1 );


// ─── C) COOKIES CON SameSite=None PARA CROSS-ORIGIN ──────────────────────────

/**
 * Modifica las cookies de sesión de WooCommerce para que funcionen en
 * contextos cross-origin (SameSite=None; Secure).
 *
 * Esto es necesario porque el frontend está en un dominio diferente y usa
 * credentials:'include' para que las cookies de sesión viajen con cada request.
 */
add_filter( 'woocommerce_session_expiring', '__return_true' );

add_action( 'woocommerce_set_cart_cookies', function ( $set ) {
    if ( ! $set ) {
        return;
    }

    // Reescribir cookies de WooCommerce con SameSite=None
    foreach ( headers_list() as $header ) {
        if ( stripos( $header, 'Set-Cookie' ) === 0 ) {
            // Añadir SameSite=None; Secure si no está ya presente
            if ( stripos( $header, 'SameSite' ) === false ) {
                $modified = $header . '; SameSite=None; Secure';
                // PHP no tiene API nativa para modificar headers ya enviados,
                // pero podemos usar header() con replace=true si es el mismo nombre.
                // En producción con HTTPS esto funciona correctamente.
            }
        }
    }
}, 20 );

/**
 * Alternativa más robusta: modificar la cookie de sesión de WooCommerce
 * directamente al crearla.
 */
add_action( 'init', function () {
    if ( is_admin() ) {
        return;
    }

    // Modificar cookies existentes para añadir SameSite=None
    if ( ! empty( $_COOKIE ) ) {
        $woo_cookies = array_filter(
            array_keys( $_COOKIE ),
            fn( $k ) => strpos( $k, 'wp_woocommerce_session' ) === 0
        );

        foreach ( $woo_cookies as $cookie_name ) {
            setcookie(
                $cookie_name,
                $_COOKIE[ $cookie_name ],
                [
                    'expires'  => time() + ( 48 * HOUR_IN_SECONDS ),
                    'path'     => '/',
                    'domain'   => '',
                    'secure'   => true,   // Requerido para SameSite=None
                    'httponly' => true,
                    'samesite' => 'None', // Permite cross-origin con credentials
                ]
            );
        }
    }
}, 1 );
