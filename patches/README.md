# Patches

## `@excalidraw/mermaid-to-excalidraw@2.2.2`

Every mermaid diagram containing a `subgraph` was converted into a single flat
raster image instead of editable Excalidraw elements — no nodes, no styling, no
way to interact with it.

`parseSubGraph` locates the rendered cluster with an exact id selector:

```js
const el = containerEl.querySelector(`[id='${data.id}']`)
```

Mermaid 11 (`^11.12.1`, the version the package itself depends on) renders
clusters as `<renderId>-<subgraphId>`, so the lookup misses, `parseSubGraph`
throws `SubGraph element not found`, and the library falls back to rasterising
the whole diagram. Vertices and edges are unaffected because they are looked up
with a substring selector (`[id*="…"]`) a few lines below.

The patch reads the render id off the container's `<svg>` and retries with the
prefixed id. With it, a nested-subgraph flowchart converts to 14 real elements
instead of 1 image.

The dependency is pinned to an exact version so an upgrade cannot silently
detach the patch — when bumping it, re-check whether this is fixed upstream.
