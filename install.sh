#!/usr/bin/env bash
# Installs AlxPro Dark and AlxPro Light for the terminal this runs in, then
# shows the banner.
#
#   curl -fsSL https://raw.githubusercontent.com/al-xpro/alxpro-theme/main/install.sh | bash
#   curl -fsSL …/install.sh | bash -s -- ghostty    a terminal by name
#   ./install.sh --banner                            only the banner
#
# Terminals: terminal-app iterm2 ghostty warp wezterm kitty alacritty vscode.
# Theme files go into the terminal's own themes folder, or are imported with
# `open` for Terminal.app and iTerm2. No config file is edited: the line that
# turns the theme on is printed for you to add.
set -euo pipefail

RAW="https://raw.githubusercontent.com/al-xpro/alxpro-theme/main/themes"
DARK="AlxPro Dark"
LIGHT="AlxPro Light"

# From a clone, use its files; piped from curl, download them.
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || pwd)"

# The same letters as src/banner.ts; `npm run check` fails if they differ.
alxpro=(
  " █████╗ ██╗     ██╗  ██╗██████╗ ██████╗  ██████╗ "
  "██╔══██╗██║     ╚██╗██╔╝██╔══██╗██╔══██╗██╔═══██╗"
  "███████║██║      ╚███╔╝ ██████╔╝██████╔╝██║   ██║"
  "██╔══██║██║      ██╔██╗ ██╔═══╝ ██╔══██╗██║   ██║"
  "██║  ██║███████╗██╔╝ ██╗██║     ██║  ██║╚██████╔╝"
  "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ "
)
theme=(
  "████████╗██╗  ██╗███████╗███╗   ███╗███████╗"
  "╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝"
  "   ██║   ███████║█████╗  ██╔████╔██║█████╗  "
  "   ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝  "
  "   ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗"
  "   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝"
)

fetch() { # fetch <path under themes/> <destination>
  if [[ -f "$here/themes/$1" ]]; then
    cp "$here/themes/$1" "$2"
  else
    curl -fsSL "$RAW/${1// /%20}" -o "$2"
  fi
}

# dark or light: ALXPRO_APPEARANCE, then macOS's setting, then COLORFGBG.
appearance() {
  if [[ -n "${ALXPRO_APPEARANCE:-}" ]]; then
    echo "$ALXPRO_APPEARANCE"
  elif [[ "$(uname)" == Darwin ]]; then
    [[ "$(defaults read -g AppleInterfaceStyle 2>/dev/null || true)" == Dark ]] && echo dark || echo light
  else
    case "${COLORFGBG:-}" in *";7" | *";15") echo light ;; *) echo dark ;; esac
  fi
}

# The banner, fading diagonally from the text color toward the background:
# white to gray on a dark terminal, black to gray on a light one. Shadows
# (the box-drawing strokes) sit further along the fade than the blocks.
banner() {
  local mode truecolor rows=() cols i r c n ch value width
  mode="$(appearance)"
  [[ "${COLORTERM:-}" == truecolor || "${COLORTERM:-}" == 24bit ]] && truecolor=1 || truecolor=0
  if (( $(tput cols 2>/dev/null || echo 80) >= 97 )); then
    for i in 0 1 2 3 4 5; do rows+=("${alxpro[i]}  ${theme[i]}"); done
  else
    rows=("${alxpro[@]}" "${theme[@]}")
  fi

  # Under a UTF-8 locale `${s:i:1}` is a character; otherwise a byte, and
  # every non-space character in the banner is three bytes long.
  local block="█" step=1
  (( ${#block} == 1 )) || step=3

  width=95
  for r in "${!rows[@]}"; do
    local line="${rows[r]}" out="  " col=0
    i=0
    while (( i < ${#line} )); do
      ch="${line:i:1}"
      n=1
      [[ "$ch" != " " ]] && n=$step && ch="${line:i:n}"
      # 0..100 along the diagonal.
      local t=$(( (col + r * 4) * 100 / (width + ${#rows[@]} * 4) ))
      [[ "$ch" != "█" && "$ch" != " " ]] && t=$(( t + (100 - t) * 45 / 100 ))
      if (( truecolor )); then
        if [[ $mode == dark ]]; then value=$(( 255 - t * 185 / 100 )); else value=$(( t * 190 / 100 )); fi
        out+=$'\033'"[38;2;${value};${value};${value}m${ch}"
      else
        # xterm's gray ramp: 232 (#080808) to 255 (#eeeeee).
        if [[ $mode == dark ]]; then value=$(( 255 - t * 18 / 100 )); else value=$(( 232 + t * 18 / 100 )); fi
        out+=$'\033'"[38;5;${value}m${ch}"
      fi
      i=$(( i + n ))
      col=$(( col + 1 ))
    done
    printf '%s\033[0m\n' "$out"
  done
}

detect() {
  case "${TERM_PROGRAM:-}" in
    Apple_Terminal) echo terminal-app ;;
    iTerm.app) echo iterm2 ;;
    ghostty) echo ghostty ;;
    WarpTerminal) echo warp ;;
    WezTerm) echo wezterm ;;
    vscode) echo vscode ;;
    *)
      if [[ -n "${KITTY_WINDOW_ID:-}" ]]; then echo kitty
      elif [[ -n "${ALACRITTY_WINDOW_ID:-}${ALACRITTY_SOCKET:-}" ]]; then echo alacritty
      else echo unknown
      fi
      ;;
  esac
}

config="${XDG_CONFIG_HOME:-$HOME/.config}"
name=""
next=""

install_for() {
  local dir tmp
  case "$1" in
    terminal-app | iterm2)
      [[ "$(uname)" == Darwin ]] || { echo "$1 is macOS-only." >&2; exit 1; }
      tmp="$(mktemp -d)"
      if [[ $1 == terminal-app ]]; then
        name="Terminal"
        fetch "terminal-app/$DARK.terminal" "$tmp/$DARK.terminal"
        fetch "terminal-app/$LIGHT.terminal" "$tmp/$LIGHT.terminal"
        open "$tmp/$DARK.terminal" "$tmp/$LIGHT.terminal"
        next="Terminal → Settings → Profiles: select AlxPro Dark or AlxPro Light, then click Default."
      else
        name="iTerm2"
        fetch "iterm2/$DARK.itermcolors" "$tmp/$DARK.itermcolors"
        fetch "iterm2/$LIGHT.itermcolors" "$tmp/$LIGHT.itermcolors"
        open "$tmp/$DARK.itermcolors" "$tmp/$LIGHT.itermcolors"
        next="iTerm2 → Settings → Profiles → Colors → Color Presets: pick AlxPro Dark or AlxPro Light."
      fi
      ;;
    ghostty)
      name="Ghostty"
      dir="$config/ghostty/themes"
      mkdir -p "$dir"
      fetch "ghostty/$DARK" "$dir/$DARK"
      fetch "ghostty/$LIGHT" "$dir/$LIGHT"
      next="Add this to your Ghostty config, then reload it (⌘⇧,):\n\n    theme = light:AlxPro Light,dark:AlxPro Dark"
      ;;
    warp)
      name="Warp"
      [[ "$(uname)" == Darwin ]] && dir="$HOME/.warp/themes" || dir="${XDG_DATA_HOME:-$HOME/.local/share}/warp-terminal/themes"
      mkdir -p "$dir"
      fetch "warp/alxpro_dark.yaml" "$dir/alxpro_dark.yaml"
      fetch "warp/alxpro_light.yaml" "$dir/alxpro_light.yaml"
      next="Warp → Settings → Appearance → Themes: pick AlxPro Dark or AlxPro Light."
      ;;
    wezterm)
      name="WezTerm"
      dir="$config/wezterm/colors"
      mkdir -p "$dir"
      fetch "wezterm/$DARK.toml" "$dir/$DARK.toml"
      fetch "wezterm/$LIGHT.toml" "$dir/$LIGHT.toml"
      next="Add this to your wezterm.lua:\n\n    config.color_scheme = \"AlxPro Dark\""
      ;;
    kitty)
      name="Kitty"
      dir="$config/kitty/themes"
      mkdir -p "$dir"
      fetch "kitty/alxpro-dark.conf" "$dir/alxpro-dark.conf"
      fetch "kitty/alxpro-light.conf" "$dir/alxpro-light.conf"
      next="Add this to kitty.conf:\n\n    include themes/alxpro-dark.conf"
      ;;
    alacritty)
      name="Alacritty"
      dir="$config/alacritty/themes"
      mkdir -p "$dir"
      fetch "alacritty/alxpro-dark.toml" "$dir/alxpro-dark.toml"
      fetch "alacritty/alxpro-light.toml" "$dir/alxpro-light.toml"
      next="Add this to alacritty.toml:\n\n    [general]\n    import = [\"$dir/alxpro-dark.toml\"]"
      ;;
    vscode)
      name="VS Code"
      next="VS Code's terminal takes its colors from the editor theme. Install it with:\n\n    code --install-extension alxpro.alxpro-theme"
      ;;
    *)
      echo "Unknown terminal: $1. Use one of: terminal-app iterm2 ghostty warp wezterm kitty alacritty vscode" >&2
      exit 1
      ;;
  esac
}

case "${1:-}" in
  --banner)
    banner
    exit 0
    ;;
  -h | --help)
    sed -n '2,13s/^# \{0,1\}//p' "$0"
    exit 0
    ;;
  "") terminal="$(detect)" ;;
  *) terminal="$1" ;;
esac

if [[ $terminal == unknown ]]; then
  echo "Couldn't tell which terminal this is. Name it:" >&2
  echo "  curl -fsSL https://raw.githubusercontent.com/al-xpro/alxpro-theme/main/install.sh | bash -s -- ghostty" >&2
  echo "Terminals: terminal-app iterm2 ghostty warp wezterm kitty alacritty vscode" >&2
  exit 1
fi

install_for "$terminal"
echo
banner
echo
[[ $terminal == vscode ]] || printf '  Installed AlxPro Dark and AlxPro Light for %s.\n\n' "$name"
printf '  %b\n\n' "$next"
