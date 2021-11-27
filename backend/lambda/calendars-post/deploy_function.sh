#!/bin/sh
this=$(dirname "$0")
exec "$this/../deploy.sh" -n "$(basename "$this")" common.js calendars.js "$@"
