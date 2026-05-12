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

### hours
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

---

## Location Fields

### location_name
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### address
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### city
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### state
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### zip
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

---

## Phone Fields

### phone_number
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### phone_name
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

---

## Organization-Only Fields

### legal_status
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

---

## Service-Only Fields

### short_description
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### application_process
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### required_documents
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### interpretation_services
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### clinician_actions
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### cost (fee)
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

### wait_time
| Direction | Rule |
|-----------|------|
| Spreadsheet → DB | TODO |
| SFSG → DB | TODO |
| DB → SFSG | TODO |

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
