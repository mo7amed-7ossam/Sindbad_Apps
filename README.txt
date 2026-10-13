Sindbad App Launcher — Pure HTML / CSS / JS

Open index.html in a browser. The page has no React, Vite, backend, or build step.

Easy edits:
- Change application names, descriptions, icons, and links directly in the application cards in index.html.
- Change colors, spacing, typography, responsive behavior, and the background in styles.css.
- Replace the local files in assets/ when you want to update the logo, background, or fonts.

The Sindflow card currently points to ../../sindbad-workspace/?workspace so the exported folder works from this project. If you move the folder elsewhere, update that href in script.js to the new static URL.

Included files:
- index.html      Page structure
- styles.css      Visual design and responsive rules
- script.js       Search filtering, keyboard shortcut, inactive-link behavior, and Dubai clock
- assets/         Logo, background, Sindflow mark, and local Lato fonts
