# Pathbuilder Roll Copier

A simple Chrome extension that copies a formatted roll string (e.g., `/r d20+8`) to your clipboard when you click on a skill in your Pathbuilder character sheet. This makes it easy to paste the roll string into your virtual tabletop (like Roll20).

## Features

- **Click-to-Copy:** Click any skill on the Pathbuilder sheet to copy a roll string.
- **Dynamic Roll Generation:** Automatically extracts the modifier (e.g., "+8") from the clicked skill.
- **Visual Feedback:** A pop-up message appears near your click to confirm the roll string has been generated and copied.
- **Modern API:** Uses the Clipboard API and runs on Manifest V3.

## Installation

1. **Clone or Download the Repository:**

   ```bash
   git clone https://github.com/yourusername/pathbuilder-roll-copier.git