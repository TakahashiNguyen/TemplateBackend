FROM node:current-slim

COPY .bashrc /root/.bashrc

# Set up packages
RUN apt update -y && apt install -y --no-install-recommends \
    git ca-certificates \
    # Tauri dependencies
    libwebkit2gtk-4.1-dev build-essential \
    curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev \
    librsvg2-dev

# git trust all directories
RUN git config --global --add safe.directory '*'

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN yes | corepack prepare pnpm@latest --activate

# Set up rust
RUN RUSTUP_USE_CURL=1 \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Allow self-signed certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
