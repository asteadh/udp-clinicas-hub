package storage

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"hubnegocios/backend/internal/config"
)

type Service struct {
	bucket string
	client *minio.Client
}

func NewService(cfg *config.Config) (*Service, error) {
	endpoint, secure, err := normalizeEndpoint(cfg.S3Endpoint)
	if err != nil {
		return nil, err
	}
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3AccessKeyID, cfg.S3SecretAccessKey, ""),
		Secure: secure,
		Region: cfg.S3Region,
	})
	if err != nil {
		return nil, err
	}
	return &Service{bucket: cfg.S3BucketName, client: client}, nil
}

// Upload stores reader's content at folder/filename (cleaned) and returns the
// resulting object key.
func (s *Service) Upload(ctx context.Context, folder string, filename string, reader io.Reader, size int64, contentType string) (string, error) {
	path := cleanPath(folder + "/" + filename)
	if path == "" {
		return "", fmt.Errorf("path is required")
	}
	_, err := s.client.PutObject(ctx, s.bucket, path, reader, size, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", err
	}
	return path, nil
}

func (s *Service) Get(ctx context.Context, path string) (*minio.Object, error) {
	path = cleanPath(path)
	if path == "" {
		return nil, fmt.Errorf("path is required")
	}
	return s.client.GetObject(ctx, s.bucket, path, minio.GetObjectOptions{})
}

// PresignedGetURL asks MinIO itself to mint a time-limited GET URL for path.
func (s *Service) PresignedGetURL(ctx context.Context, path string, ttl time.Duration) (string, error) {
	path = cleanPath(path)
	if path == "" {
		return "", fmt.Errorf("path is required")
	}
	presigned, err := s.client.PresignedGetObject(ctx, s.bucket, path, ttl, url.Values{})
	if err != nil {
		return "", err
	}
	return presigned.String(), nil
}

func cleanPath(path string) string {
	return strings.Trim(strings.TrimSpace(path), "/")
}

func normalizeEndpoint(raw string) (string, bool, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", false, fmt.Errorf("S3_ENDPOINT is required")
	}
	secure := true
	if strings.HasPrefix(trimmed, "http://") || strings.HasPrefix(trimmed, "https://") {
		parsed, err := url.Parse(trimmed)
		if err != nil {
			return "", false, err
		}
		secure = parsed.Scheme == "https"
		trimmed = parsed.Host
	}
	return strings.TrimRight(trimmed, "/"), secure, nil
}
