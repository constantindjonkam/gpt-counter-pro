# GPT Counter Pro Chromium Extension

This Chrome extension (works on all chromium browsers) tracks the number of requests made to specific models (`o1-preview`, `gpt-4o` and `o1-mini`) on `chatgpt.com` and displays the usage count in a popup.

## Download

You can now download this extension on the chrome store.

[<img src="./images/chromestore.png" alt="chrome store" height="50px" target="_blank" rel="noopener noreferrer" />](https://chromewebstore.google.com/detail/gpt-counter-pro/loemfejnlpfdblehpjkelkhfdjcnglpn)

## Features

- Tracks requests to `o1-preview`, `gpt-4o` and `o1-mini` models.
- Displays request counts for each model.
- Allows manual increment and decrement of counts via popup buttons.
- Provides an option to edit the start date and time for counting.
- Reset dates are displayed for each counter.

## Manual Installation

1. Clone the repository or download the files.
2. Go to `chrome://extensions/` in Google Chrome or `edge://extensions/` for Edge. It should work for all chromium based browers.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the folder containing the extension files.

## Usage

1. Click the extension icon to open the popup.
2. View the request counts for `o1-preview`, `gpt-4o` and `o1-mini`.
3. Use the buttons to increment or decrement counts.
4. Click "Edit Date" to change the start date and time for counting.
5. The counts are saved locally and doesn't currently sync across browsers/computers

Note: The program doesn't know how many requests was made and when it resets initially unless you specify it in the popup. It will start counting after your first request on chatgpt when you install it.

## Screnshots

![Screenshot 1](publish/screenshot1.png) ![Screenshot 2](publish/screenshot2.png)

## How It Works

The extension listens for requests to chatgpt.com. When a conversation request matches either the o1-preview or gpt-4o models, it increments the corresponding count. The first request it captures will increment the count to 1 and set start date/time to the current date/time. It is your responsible to make sure this is correct and update it manually if needed. After the initial setup you no longer have to worry about the counter and date unless you use the same account on a different system/browser.

## Permissions

- **Web Request**: To monitor requests to `chatgpt.com`.
- **Storage**: To save request counts, reset times, and counter order.

## Todo

1. Allow counters to be reordered.
2. Allow selection of models
3. Sync count between different browers/systems in realtime
4. Add option to show count on gpt web interface

## License

This project is licensed under the MIT License.
