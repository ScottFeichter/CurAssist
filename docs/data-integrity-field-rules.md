# Data Integrity — Field Rules by Direction

This document tracks the sanitization and validation rules for every field across all three data transit directions.

---

## Directions

| Direction | Description | Where it happens |
|-----------|-------------|-----------------|
| **Incoming from Spreadsheet** | Raw cell values from uploaded .xlsx/.ods → MongoDB | `sanitizeIncoming()` in each sanitizer |
| **Incoming from SFSG** | Values from SF Service Guide API response → MongoDB | `sanitizeIncomingFromSFSG()` in each sanitizer |
| **Outgoing to SFSG** | Values from MongoDB → SF Service Guide API payload | `sanitizeOutgoing()` in each sanitizer |

---

## Header Validation (Spreadsheet Only)

| Rule | Behavior |
|------|----------|
| Required columns | `Name` must exist — upload rejected if missing |
| Whitespace | Headers are trimmed before matching |
| Case sensitivity | Case-insensitive matching (`"name"` matches `"Name"`) |
| Unrecognized columns | Reported as warnings with "did you mean?" suggestions (Levenshtein ≤ 3) |
| Misspelled columns | Not rejected — just warned. Data in that column is ignored. |

---

## Shared Fields (Organization + Service)

### name ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim + Title Case. **Required** — empty is invalid. |
| SFSG → DB | Trust as-is, just trim. |
| DB → SFSG | Trim + Title Case (catches manually entered unsanitized data). |

### alternate_name (Nickname) ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim. If ALL CAPS → Title Case. Otherwise preserve casing. |
| SFSG → DB | Trust as-is, just trim. |
| DB → SFSG | Trim. If ALL CAPS → Title Case. Otherwise preserve casing. |

### website ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Validate URL pattern. Prepend `https://` if missing. Lowercase. Add trailing slash. Clear "none"/"N/A". Reject if invalid pattern. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Ensure `https://` prefix, lowercase, add trailing slash. |

### email ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim, lowercase. Validate `/^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`. Clear "none"/"N/A". Reject if provided but invalid. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim + lowercase. |

### description (long_description) ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, normalize line breaks (collapse 3+ to 2), trim. Reject if > 3000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, normalize line breaks, trim (SFSG expects plain text). |

### internal_notes ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, normalize line breaks, trim. Reject if > 3000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, normalize line breaks, trim (plain text). |

### markdown_notes ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Normalize line breaks, trim. Do NOT strip HTML (markdown may use it). Reject if > 3000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, normalize line breaks, trim (SFSG expects plain text in notes). |

### hours ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim. If value present, caller appends "See spreadsheet for hours details" to internal notes. Too many freeform formats to parse. |
| SFSG → DB | Trust as-is (same `{ schedule_days: [{ day, opens_at, closes_at }] }` format we store). |
| DB → SFSG | Pass-through (same format SFSG expects). Conversion from form HH:MM to minutes handled in save route. |

---

## Location Fields

### location_name ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim + Title Case. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim + Title Case (matches SFSG format: "North Beach", "Office"). |

### address ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim + Title Case. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim + Title Case (matches SFSG format: "1170 Columbus Avenue"). |

### city ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim + Title Case. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim + Title Case (matches SFSG format: "San Francisco"). |

### state ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim, uppercase. Accepts 2-letter codes or full state names ("California" → "CA"). Rejects unrecognized values. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim + uppercase (matches SFSG format: "CA"). |

### zip ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim. Accepts "94103" or "94103-1234" — strips -XXXX suffix, stores 5 digits only. Rejects if not 5 digits. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim (should already be 5 digits). |

---

## Phone Fields

### phone_number ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip non-digits, validate exactly 10 digits, store digits only ("4155551234"). Reject if not 10 digits. |
| SFSG → DB | Strip formatting to digits only (SFSG returns "(415) 766-6092", we store "4157666092"). |
| DB → SFSG | Digits only — strip any formatting (SFSG create expects "4157716600"). |

### phone_name ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim only — pass through as-entered (SFSG stores mixed case). |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim. Defaults to "voice" if empty (SFSG requires service_type — omitting causes 500). |

---

## Organization-Only Fields

### legal_status ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Trim only — preserves original casing/formatting ("501(c)(3)", "Nonprofit"). |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Trim only — SFSG accepts plain string as-is. |

---

## Service-Only Fields

### short_description ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### application_process ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### required_documents ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### interpretation_services ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### clinician_actions ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### cost (fee) ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### wait_time ✅ DONE
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | Strip HTML, trim. Reject if > 1000 chars. |
| SFSG → DB | Trust exactly as-is, no modification. |
| DB → SFSG | Strip HTML, trim (SFSG expects plain text). |

### categories
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### eligibilities
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

---

## Notes

- **"Trust as-is"** means the value from SFSG is stored in MongoDB exactly as received — no trimming, no casing changes, no modification.
- **Required fields:** Only `name` is required. All others are optional (empty is valid, but if provided must pass validation).
- **Validation failures** do not stop processing other fields in the same row. All errors are collected and reported together.
- **"Clear none/N/A"** means values like "none", "n/a", "na", "-", "tbd", "unknown" are treated as empty (valid, stored as empty string).
