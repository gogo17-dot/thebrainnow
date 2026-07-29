# Interactive Cerebellum

A 3D, touch-friendly cerebellum anatomy explorer. Click any structure to see its name and clinical description.

## Structures included

- Vermis lobules (lingula through nodule)
- Hemispheric lobules (quadrangular, semilunar, tonsil, and more)
- Flocculonodular lobe
- Cerebellar peduncles
- Deep cerebellar nuclei (dentate, interposed, fastigial)

## Run

```powershell
cd neural-network-simulator
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Open http://localhost:8080

## Controls

- **Click / tap** — select a structure, show info panel
- **Drag** — rotate model
- **Scroll** — zoom
- **Re-click** — cycle through overlapping structures

Teaching model only — not for clinical diagnosis.
