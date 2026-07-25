package admin

import (
	"context"
	"encoding/json"
	"net/http"
)

func (r *Repository) ListSettingsAdmin(ctx context.Context) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object('key', key, 'value', value, 'updatedBy', updated_by, 'updatedAt', updated_at)
FROM app_settings ORDER BY key`)
}

func (r *Repository) UpdateSetting(ctx context.Context, key string, value map[string]any, updatedBy string) error {
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO app_settings (key, value, updated_by)
VALUES ($1, $2, $3)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
		key, raw, nilIfEmptyAny(updatedBy))
	return err
}

// --- HTTP handlers (superadmin only — settings are institutional, not
// clinic-scoped) ------------------------------------------------------------

func (h *Handlers) listSettings(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListSettingsAdmin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"settings": values})
}

type updateSettingRequest struct {
	Value map[string]any `json:"value"`
}

func (h *Handlers) updateSetting(w http.ResponseWriter, r *http.Request) {
	var body updateSettingRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	key := r.PathValue("key")
	actor := principalFromContext(r)
	if err := h.repo.UpdateSetting(r.Context(), key, body.Value, actor.UserID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "setting.update", "setting", key, body.Value)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
