## Order Status Fix (April 2, 2026)
- Free orders (isFree: true) were stuck in "processing" status
- Root cause: WooCommerce overrides status via payment lifecycle hooks even when 
  status: 'completed' is sent in the POST payload
- Fix: Two-step approach in createWooOrder() — POST to create order, 
  then immediately PATCH {orderId} with status: 'completed' if isFree
- File modified: api/complete-order.ts
- Do NOT revert this logic
