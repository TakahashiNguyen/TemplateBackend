FROM node:current-slim

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Set up packages
RUN apt update -y && apt install -y --no-install-recommends git curl ca-certificates

# Set up homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Set up minio-client
RUN brew install minio-mc
