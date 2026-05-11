# VANTAGE ONYX DASHBOARD
**Luxury Real Estate Intelligence Engine**

## 60-Second Setup
1. Push these files to GitHub.
2. Link the repo to Vercel.
3. Add Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Whale Logic
System automatically flags leads as **WHALE DETECTED** if:
- `device_type` contains 'iPhone'
- `dwell_time` > 180 seconds

## Tactical Features
- **Shadow-Command UI**: Matte black with zero backdrop-blur for mobile performance.
- **Stealth Mode**: Header toggle to hide sensitive lead data during demos.
- **Heatmap**: Properties pulse red when `view_count` exceeds 500.
