FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY frontend/web/package.json frontend/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @medhavi/web build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/frontend/web/.next ./.next
COPY --from=build /repo/frontend/web/node_modules ./node_modules
COPY --from=build /repo/frontend/web/package.json ./
COPY --from=build /repo/frontend/web/public ./public
COPY --from=build /repo/packages ./packages
EXPOSE 3000
CMD ["npm", "start"]
