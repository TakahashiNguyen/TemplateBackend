FROM node:current-slim

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set up packages
RUN apt update -y && apt install -y --no-install-recommends git curl ca-certificates

# Set up minio-client
RUN curl https://dl.min.io/client/mc/release/linux-arm64/mc --create-dirs \
  -o /bin/mc && \
  chmod +x /bin/mc
