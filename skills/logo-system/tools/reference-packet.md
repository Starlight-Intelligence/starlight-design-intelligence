# Identity reference packet

Keep the private source artwork beside the JSON packet. The `conditioned_files` list is the input adapter’s list of files actually passed to the renderer or image model. The checker validates that supplied list; the caller must retain the render or generation receipt to demonstrate delivery.

```json
{"brand":"example","tier":"essential","visual_reviewer":"art director","geometry_invariants":["Two measured inward-facing terminals"],"anchors":[{"file":"source.png","sha256":"<digest of the retrieved bytes>","source":"<stable source URL or VIS record>","source_class":"rendition"}],"conditioned_files":["source.png"],"stage":"comparison","independent_critique":{"reviewer":"second reviewer","finding":"The aperture holds at 32 pixels; the terminal gap closes at 16."}}
```

Use `source-file`, `rendition` or `reconstruction` for each source. Use `comparison` when reporting comparative judgment. A passing check verifies file binding; founder and rights decisions remain separately recorded.

Use Pillow for raster decoding. For generation, pass `--catalog trusted-sources.json` retrieved independently from VIS or the owning repository. It maps source URI strings to their independently verified SHA-256 values. Keep it outside the editable job. A comparison without this manifest reports source authority as unverified.
