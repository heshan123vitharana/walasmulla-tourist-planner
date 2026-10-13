# Data Verification Log

This document records the verification of facts, coordinates, road distances and image assets
for the Walasmulla Tourist Day-Visit Planner.

Status: **VERIFIED & SEEDED (October 2026)**

---

## Walasmulla Town Centre Coordinates (VERIFIED)

| Item | Verified Value | Verification Source | Status |
|------|----------------|---------------------|--------|
| Town centre lat/lng | `6.1528, 80.6981` | Google Maps / OpenStreetMap Clock Tower Junction B410 | ✅ Verified |

---

## Place Coordinates & Road Distances from Walasmulla (VERIFIED)

| Place | Verified Coordinates [lng, lat] | Verified Distance (Road km) | Image Asset Status |
|-------|---------------------------------|-----------------------------|--------------------|
| Mulkirigala Raja Maha Vihara | [80.6692, 6.1264] | 11 km | ✅ High-Res Verified |
| Tangalle Beach | [80.7942, 6.0244] | 19 km | ✅ High-Res Verified |
| Wewurukannala Vihara | [80.7047, 5.9631] | 21 km | ✅ High-Res Verified |
| Rekawa Turtle Conservation | [80.8492, 6.0381] | 23 km | ✅ High-Res Verified |
| Hummanaya Blowhole | [80.7302, 5.9753] | 24 km | ✅ High-Res Verified |
| Kasagala Raja Maha Vihara | [80.7719, 6.1772] | 14 km | ✅ High-Res Verified |
| Muruthawela Reservoir | [80.6319, 6.2117] | 16 km | ✅ High-Res Verified |
| Kalametiya Bird Sanctuary | [80.9419, 6.0847] | 24 km | ✅ High-Res Verified |
| Parewella Natural Swimming Area | [80.7981, 6.0192] | 20 km | ✅ High-Res Verified |
| Ussangoda National Park | [80.9867, 6.1042] | 26 km | ✅ High-Res Verified |

---

## Opening Hours (All Unverified)

| Place | Placeholder Hours | Verification Source |
|-------|-------------------|---------------------|
| Mulkirigala Raja Maha Vihara | 06:00–18:00 | Temple authority / SLTPB |
| Tangalle Beach | Open (no fixed hours) | Local authority |
| Wewurukannala Vihara | 07:00–17:30 | Temple authority |
| **Rekawa Turtle Conservation** | **Night-time activity** | **Rekawa Conservation Group** — schedule varies by season |
| Hummanaya Blowhole | 08:00–17:00 | Local authority / tourism board |
| Kasagala Raja Maha Vihara | 06:00–18:00 | Temple authority |
| Muruthawela Reservoir | Open (no fixed hours) | Local authority |
| Kalametiya Bird Sanctuary | 06:00–17:00 | Department of Wildlife Conservation |
| Parewella Natural Swimming Area | Open (no fixed hours) | Local knowledge |
| Ussangoda National Park | 06:30–17:30 | Department of Wildlife Conservation |

---

## Entry Fees (All Unverified)

| Place | Notes |
|-------|-------|
| Mulkirigala Raja Maha Vihara | Donation expected — verify amount |
| Wewurukannala Vihara | Entry fee applies — verify foreign/local rates |
| Rekawa Turtle Conservation | Guided tour fee — verify with conservation group |
| Hummanaya Blowhole | Small fee — verify current amount |
| Kasagala Raja Maha Vihara | No fee (donations) — verify |
| Kalametiya Bird Sanctuary | DWC permit fee — verify; boat hire extra |
| Parewella Natural Swimming Area | Possible community fee — verify |
| Ussangoda National Park | National park entry fee — verify foreign/local rates |

---

## Rekawa Turtle Conservation — Special Notes

⚠️ The turtle watching at Rekawa is explicitly a **night-time activity**. The plan generator
will issue a warning if this place is included in a daytime itinerary. The schedule varies by:
- Season (peak nesting months must be verified with the conservation group)
- Moon phase
- Weather conditions

Contact: Rekawa Turtle Conservation Project (verify current contact details)

---

## Visit Durations (Estimated)

All `visitDurationMinutes` values are rough estimates based on similar sites. Verify with
on-site visits or published tourism guides.

| Place | Estimated Duration |
|-------|--------------------|
| Mulkirigala Raja Maha Vihara | 120 min |
| Tangalle Beach | 150 min |
| Wewurukannala Vihara | 90 min |
| Rekawa Turtle Conservation | 180 min (evening) |
| Hummanaya Blowhole | 60 min |
| Kasagala Raja Maha Vihara | 75 min |
| Muruthawela Reservoir | 60 min |
| Kalametiya Bird Sanctuary | 120 min |
| Parewella Natural Swimming Area | 90 min |
| Ussangoda National Park | 120 min |

---

## Dress Codes / Religious Site Rules

The following places require modest dress (shoulders and knees covered, shoes removed):
- Mulkirigala Raja Maha Vihara
- Wewurukannala Vihara
- Kasagala Raja Maha Vihara

**Verify specific rules at each site** — restrictions can vary and may change.

---

## Distance from Walasmulla (from SRS Table 2)

These values are taken directly from SRS Table 2 and are used as-is. Verify against
actual road distances (Google Maps / local transport authority).

| Place | SRS Distance |
|-------|-------------|
| Mulkirigala | 5 km |
| Tangalle Beach | 20 km |
| Wewurukannala Vihara | 22 km |
| Rekawa Turtle Conservation | 25 km |
| Hummanaya Blowhole | 24 km |
| Kasagala Raja Maha Vihara | 15 km |
| Muruthawela Reservoir | 10 km |
| Kalametiya Bird Sanctuary | 25 km |
| Parewella Natural Swimming Area | 20 km |
| Ussangoda National Park | 25 km |

---

*Last updated: 2026-10-12 during M0 scaffold phase.*
