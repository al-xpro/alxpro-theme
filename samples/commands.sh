# Commands as they appear in docs and READMEs: the program is purple,
# everything it's given is green, and each `&&` or `|` starts a new command.
cd ~/acme && git pull --rebase && pnpm install
pnpm dlx shadcn@latest add button card
npx create-next-app@latest my-app --ts --tailwind --app
yarn add -D @types/node
bunx --bun vite build
sudo rm -rf node_modules .next
mkdir -p src/components && touch src/components/button.tsx
mv old.tsx new.tsx && cp .env.example .env.local
cat package.json | grep -i "next"
curl -fsSL https://example.com/install.sh | bash
wget -qO- https://example.com/data.json > data.json
chmod +x scripts/deploy.sh && pwd
node --version
docker compose up -d --build
docker-compose logs -f web
gh pr create --fill --base main
vercel deploy --prod
echo "Deploying $BRANCH to ${ENVIRONMENT:-preview}" > deploy.log 2>&1
ls -la
