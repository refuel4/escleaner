#!/usr/bin/env bash
# Script to run run the container locally
# Rename ".env.default" to ".env"

set -e

# Find the directory of the script and cd there
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if `type yarn 2>&1 > /dev/null`; then
	PKG_MGR="yarn"
elif `type npm 2>&1 > /dev/null`; then
	PKG_MGR="npm"
else
	echo "no package manager for node found... bye!"
	exit 1
fi

echo "package manager is ${PKG_MGR}"

# Install dependencies
[ ! -d "node_modules" ] && ${PKG_MGR} install

# Build in case
${PKG_MGR} run build

# Execute the program
if [ -f ".env" ]; then
	source ./.env
	node dist/index.js
else
	echo ".env file not found... bye!"
	exit 1
fi

