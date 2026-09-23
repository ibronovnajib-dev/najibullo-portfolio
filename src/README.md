# Source modules

`script.js` and `styles.css` at the repository root are compatibility snapshots for the existing Render static service.
The maintainable source-of-truth is `src/js/*.js` and `src/styles/*.css`; `build.py` concatenates them in lexical order into `dist/`.
Do not edit the root snapshots directly. Run `python3 sync_snapshots.py` after editing modules.
