FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY backend/worker/package.json backend/worker/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @medhavi/worker build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/backend/worker/dist ./dist
COPY --from=build /repo/backend/worker/node_modules ./node_modules
COPY --from=build /repo/backend/worker/package.json ./
COPY --from=build /repo/packages ./packages
CMD ["node", "dist/main.js"]
