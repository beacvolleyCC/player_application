Club Control Player V2.3.10.26O-P11C

Scope: BRSZ-style standings columns only.
- Final compact Player columns: # | Csapat | M | GY | V | P | Szett | Szettarány | Pontok | Pontarány.
- Szett displayed as won–lost pair (e.g. 35–7).
- Pontok displayed as won–lost rally points (e.g. 987–775).
- Set and point ratios use canonical source values and render to 3 decimals; fallback calculation is used only when source ratio is blank.
- Existing official BRSZ order remains primary once results/points exist.
- If all table points are zero/blank, provisional Hungarian alphabetical order from P11B remains.
- P11B header, own-team highlight, hidden multi-team switcher and P11A mobile horizontal scrolling remain unchanged.
- No SQL change required; existing Player standings RPC already exposes setRatio and pointRatio.
