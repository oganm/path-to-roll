# Pathbuilder Roll Copier

A Chrome extension that enhances the interaction between Pathbuilder 2e character sheets and Roll20. It automatically copies skill checks to your clipboard and can directly paste them into Roll20's chat.

## Features

### Roll Management
- **One-Click Rolling**: Click any skill on your Pathbuilder sheet to generate a formatted roll string
- **Roll20 Template Format**: Rolls are formatted using Roll20's template system, including:
  - Character name
  - Skill name
  - Roll formula with modifier
- **Automatic Roll20 Integration**: If a single Roll20 game tab is open, the roll will be automatically pasted into the chat

### Status Indicators
- **Pathbuilder Status**: Shows whether a Pathbuilder character sheet is open
- **Roll20 Status**: Shows whether Roll20 is open
  - Green: One game tab open (ready for auto-paste)
  - Orange: Multiple game tabs open
  - Red: No game tab open

### Customization
- **Dice Tray Control**: Toggle Pathbuilder's native dice tray and tinting effect
  - When enabled: Blocks Pathbuilder's dice tray for a cleaner experience
  - When disabled: Allows both Roll20 integration and Pathbuilder's native rolling

## Installation

1. **Download the Extension**:
   - Clone this repository or download it as a ZIP file
   ```bash
   git clone https://github.com/yourusername/pathbuilder-roll-copier.git
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the folder containing the extension files

3. **Verify Installation**:
   - The extension icon should appear in your Chrome toolbar
   - Click it to see the status indicators
   - Green indicators show when Pathbuilder and Roll20 are properly connected

## Usage

1. **Basic Roll**:
   - Open your Pathbuilder character sheet
   - Open your Roll20 game
   - Click any skill in Pathbuilder
   - The roll will be copied to your clipboard and (if enabled) pasted into Roll20

2. **Status Panel**:
   - Click the extension icon to see connection status
   - Green circles indicate connected services
   - Orange/red indicate potential issues

3. **Settings**:
   - Use the checkbox in the extension popup to toggle Pathbuilder's native dice tray
   - Settings persist between sessions

## Troubleshooting

- **Rolls not pasting in Roll20**: Ensure only one Roll20 game tab is open
- **Multiple Roll20 tabs**: The extension will only auto-paste when exactly one game tab is open
- **Pathbuilder dice tray still showing**: Try toggling the checkbox in the extension popup

## Contributing

Feel free to submit issues and enhancement requests!