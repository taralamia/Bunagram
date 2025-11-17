# Dockerfile (in backend/ folder)
FROM oven/bun:1

# Critical: Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy ALL files (including src/, lib/, etc.)
COPY . .

# Debug: List files to confirm src/cli.ts exists
RUN ls src/

# Expose port
EXPOSE 3000

# Run  src/cli.ts
CMD ["bun", "run", "src/cli.ts"]