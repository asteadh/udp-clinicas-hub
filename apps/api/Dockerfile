FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS build
ARG TARGETARCH
WORKDIR /src
COPY apps/api/go.mod apps/api/go.sum* ./
RUN go mod download
COPY apps/api/ ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=$TARGETARCH go build \
      -ldflags="-s -w" \
      -trimpath \
      -o /out/hubnegocios-api \
      ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux GOARCH=$TARGETARCH go build \
      -ldflags="-s -w" \
      -trimpath \
      -o /out/hubnegocios-seed \
      ./cmd/seed

FROM scratch
COPY --from=build /out/hubnegocios-api /hubnegocios-api
COPY --from=build /out/hubnegocios-seed /hubnegocios-seed
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY apps/api/migrations /migrations
COPY apps/api/seeds /seeds
USER 65532:65532
EXPOSE 4000
CMD ["/hubnegocios-api"]
