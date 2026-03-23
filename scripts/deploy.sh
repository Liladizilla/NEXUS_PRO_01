#!/bin/bash
# Odyseus Mesh Deployment Script

set -e

echo "--- [ODYSEUS] Starting Deployment Pipeline ---"

# 1. Build Core Engine (Rust/WASM)
echo "Building Core Engine (Rust)..."
cd core/engine && cargo build --release --target wasm32-unknown-unknown
cd ../..

# 2. Build Gateway (Go)
echo "Building Gateway (Go)..."
go build -o bin/gateway core/gateway/main.go

# 3. Build Frontend & Backend
echo "Building Frontend & Backend (Node.js)..."
npm run build

# 4. Containerize
echo "Building Docker Images..."
docker build -t odyseus/gateway:latest -f infra/docker/Dockerfile .

# 5. Deploy to Kubernetes
echo "Deploying to Kubernetes..."
kubectl apply -f infra/k8s/deployment.yaml

echo "--- [ODYSEUS] Deployment Complete ---"
