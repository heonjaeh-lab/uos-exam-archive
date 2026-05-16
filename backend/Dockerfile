# Puppeteer 공식 권장 베이스 이미지 (Chromium 포함)
FROM node:20-slim

# Chromium 실행에 필요한 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    fonts-noto-cjk \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer가 자체 Chromium 다운로드 안 하도록 (시스템 chromium 사용)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install --omit=dev

# 소스 복사
COPY src ./src

# 비루트 사용자로 실행 (보안)
RUN groupadd -r app && useradd -r -g app -G audio,video app \
    && mkdir -p /home/app && chown -R app:app /home/app /app
USER app

EXPOSE 3001

CMD ["node", "src/server.js"]
