#!/bin/bash
grep -o '"[a-zA-Z0-9-]*:[a-zA-Z0-9-]*"' src/components/QuickActions.tsx | sort | uniq | sed -e 's/^/  /' | sed -e 's/$/,/'
