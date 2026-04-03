#!/bin/sh

if [ -n "$VERCEL" ] || [ -n "$VERCEL_ENV" ]; then
  exec vite
fi

exec vercel dev
