Sindbad App Launcher
====================
Static HTML, CSS and JavaScript. No build step required.
Open index.html, or serve this folder with a local static web server.
Use a web server for reliable PDF downloading.

Structure
---------
index.html         Page markup, app cards and application URLs (target_link).
assets/styles/     Base styles, brand, app board, light theme, responsive rules and guide.
assets/scripts/    App navigation, search and Dubai clock.
assets/images/     Logos, application icons and background images.
assets/fonts/      Local fonts and the Nunito Sans license.
assets/docs/       Oplink online training PDF.

Editing
-------
Change app names and target_link URLs in index.html.
Style the Oplink notification in assets/styles/oplink-guide.css.
Its behavior is in assets/scripts/app-board.js.
Replace assets/docs/oplink-training-guide.pdf to update the training guide.
Keep stylesheet order in index.html: later files override earlier styles.

Archives
--------
Old files and original images were moved to a sibling archive directory.
A full ZIP backup was saved alongside this project before cleanup.
Do not deploy the sibling backup or archive.
