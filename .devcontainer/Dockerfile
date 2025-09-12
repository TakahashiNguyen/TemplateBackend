FROM node:current-slim

COPY .bashrc /root/.bashrc

# Set up packages
RUN apt update -y && apt install -y --no-install-recommends \
    git ca-certificates \
    # Tauri dependencies
    libwebkit2gtk-4.1-dev build-essential \
    curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev \
    librsvg2-dev xdg-utils \
    # Android sdk dependencies
    unzip gradle

# git trust all directories
RUN git config --global --add safe.directory '*'

# android sdk install
ARG ANDROID_SDK_TOOLS_VERSION=13114758_latest
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p "${ANDROID_HOME}/cmdline-tools"; \
    wget -q "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_TOOLS_VERSION}.zip" -O /tmp/cmdline-tools.zip; \
    unzip -q /tmp/cmdline-tools.zip -d "${ANDROID_HOME}/cmdline-tools"; \
    mv "${ANDROID_HOME}/cmdline-tools/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest"; \
    rm /tmp/cmdline-tools.zip

# android ndk install
ARG ANDROID_NDK_VERSION=r27d
ENV NDK_HOME=/opt/android-ndk
RUN mkdir -p "${NDK_HOME}"; \
    wget -q "https://dl.google.com/android/repository/android-ndk-${ANDROID_NDK_VERSION}-linux.zip" -O /tmp/ndk.zip; \
    unzip -q /tmp/ndk.zip -d "${NDK_HOME}"; \
    mv ${NDK_HOME}/android-ndk-${ANDROID_NDK_VERSION}/* "${NDK_HOME}"; \
    rm /tmp/ndk.zip

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@latest --activate


# Set up rust
RUN RUSTUP_USE_CURL=1 \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Allow self-signed certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
