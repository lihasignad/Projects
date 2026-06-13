FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY backend/api/package.json backend/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @medhavi/api prisma:generate \
 && pnpm --filter @medhavi/api build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/backend/api/dist ./dist
COPY --from=build /repo/backend/api/node_modules ./node_modules
COPY --from=build /repo/backend/api/prisma ./prisma
COPY --from=build /repo/backend/api/package.json ./
EXPOSE 4000
CMD ["node", "dist/main.js"]