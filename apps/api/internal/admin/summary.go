package admin

import (
	"context"
	"net/http"
)

type clinicCounts struct {
	ClinicSlug        string `json:"clinicSlug"`
	Faqs              int    `json:"faqs"`
	Articles          int    `json:"articles"`
	GalleryAlbums     int    `json:"galleryAlbums"`
	TeamMembers       int    `json:"teamMembers"`
	PendingInquiries  int    `json:"pendingInquiries"`
}

func (r *Repository) SummaryForClinic(ctx context.Context, clinicSlug string) (clinicCounts, error) {
	counts := clinicCounts{ClinicSlug: clinicSlug}
	err := r.pool.QueryRow(ctx, `
SELECT
  (SELECT count(*) FROM faqs WHERE clinic_slug = $1),
  (SELECT count(*) FROM articles WHERE clinic_slug = $1),
  (SELECT count(*) FROM gallery_albums WHERE clinic_slug = $1),
  (SELECT count(*) FROM team_members WHERE clinic_slug = $1),
  (SELECT count(*) FROM contact_inquiries WHERE clinic_slug = $1 AND status = 'new')`,
		clinicSlug).Scan(&counts.Faqs, &counts.Articles, &counts.GalleryAlbums, &counts.TeamMembers, &counts.PendingInquiries)
	return counts, err
}

func (r *Repository) SummaryAllClinics(ctx context.Context) ([]clinicCounts, error) {
	rows, err := r.pool.Query(ctx, `SELECT slug FROM clinics ORDER BY sort_order, name`)
	if err != nil {
		return nil, err
	}
	var slugs []string
	for rows.Next() {
		var slug string
		if err := rows.Scan(&slug); err != nil {
			rows.Close()
			return nil, err
		}
		slugs = append(slugs, slug)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return nil, err
	}

	summaries := make([]clinicCounts, 0, len(slugs))
	for _, slug := range slugs {
		counts, err := r.SummaryForClinic(ctx, slug)
		if err != nil {
			return nil, err
		}
		summaries = append(summaries, counts)
	}
	return summaries, nil
}

// --- HTTP handler ----------------------------------------------------------

func (h *Handlers) summary(w http.ResponseWriter, r *http.Request) {
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		counts, err := h.repo.SummaryForClinic(r.Context(), principal.ClinicSlug)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"clinic": counts})
		return
	}
	summaries, err := h.repo.SummaryAllClinics(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	totals := clinicCounts{}
	for _, s := range summaries {
		totals.Faqs += s.Faqs
		totals.Articles += s.Articles
		totals.GalleryAlbums += s.GalleryAlbums
		totals.TeamMembers += s.TeamMembers
		totals.PendingInquiries += s.PendingInquiries
	}
	writeJSON(w, http.StatusOK, map[string]any{"totals": totals, "byClinic": summaries})
}
