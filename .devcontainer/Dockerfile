FROM node:current-slim

# Set up packages
RUN apt update -y && apt install -y --no-install-recommends \
    git ca-certificates

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN yes | corepack prepare pnpm@latest --activate
