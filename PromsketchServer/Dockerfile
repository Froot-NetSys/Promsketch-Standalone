# ---- Builder ----
FROM golang:1.22 as builder
WORKDIR /app

# Cache modules first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest
COPY . .

# Build a static Linux binary
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -trimpath -tags netgo -ldflags='-s -w -extldflags "-static"' -o promsketch-server ./main.go

# ---- Runner (distroless static) ----
FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=builder /app/promsketch-server /usr/local/bin/promsketch-server

# Main API and pprof
EXPOSE 7000 6060
# Partition ports (adjust as needed)
EXPOSE 7100-7124

# Run as non-root
USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/promsketch-server"]
