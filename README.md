# gdc-calendar-tool
A Chrome extension for adding GDC sessions to your Google Calendar with one click!

## Installation
### Chrome Web Store
- ~~Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/gdc-calendar-tool/pcegnhfgcahkoihgmecbplanamokaede) to install the latest version.~~

### Download Locally
- Download the latest version's .zip source file from the [releases page](https://github.com/jacobfdunbar/gdc-calendar-tool/releases)
- Extract the downloaded .zip file into a new folder
- Navigate to the Extensions page in Chrome using one of the following options:
  - Click the Extensions icon (puzzle piece) -> Manage Extensions
  - Click the "Menu" button (three dots) -> Settings -> Extensions
  - Type "chrome://extensions" in the URL bar
- Click the "Developer Mode" toggle in the top right
- Click "Load unpacked" in the top left and select the extracted folder (the one actually containing the source files)

## Usage
- Navigate to any individual session page from the [GDC Session Schedule page](https://schedule.gdconf.com)
- Use the "Add to Calendar" or "Add Important" buttons to add that event to your Google calendar.
- That's it!

## Options
You can set the colors of added events and specify what calendar to add events to by opening the Options page for the extension.

### Opening the Options page
Click the Extensions icon (puzzle piece), then the "Menu" button (three dots) next to the extension, then "Options"

### Setting Colors
Use the dropdowns to set your desired color. These color names can be found on Google Calendar if you want to match existing colors.
The "Default Color" is the color you want to use for "normal" sessions.
The "Important Color" is the color you want to use for "must attend" or otherwise special sessions.

### Setting Calendar
To specify what calendar you'd like the events to be added to, perform the following steps:
- Go to the [Google Calendar website](https://calendar.google.com/)
- Click the "Menu" button (three dots) -> "Settings and sharing" next to the calendar you'd like to use (under "My calendars" on the left-hand side)
- Scroll down to the "Integrate calendar" section and copy & paste the "Calendar ID" into the field on the extension's Options page

Note: By default the extension will use your Google account's primary calendar, so just leave the Calendar ID field blank if that's what you want!
