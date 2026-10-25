#!/usr/bin/env bash
# Prints the terminal samples in their colors, to check a terminal theme.
#   samples/terminal/show.sh            every sample
#   samples/terminal/show.sh git tests  only these
set -euo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if (( $# )); then
  names=("$@")
else
  names=()
  for file in "$dir"/*.ansi; do names+=("$(basename "$file" .ansi)"); done
fi

for name in "${names[@]}"; do
  printf '\n\033[2m── %s ──\033[0m\n\n' "$name"
  # %b turns the files' \033 into the escape character.
  printf '%b\n' "$(cat "$dir/$name.ansi")"
done
