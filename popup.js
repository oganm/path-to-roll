// Check status of Pathbuilder and Roll20 tabs
chrome.tabs.query({}, function(tabs) {
    // Get UI elements
    const pathbuilderButton = document.getElementById('pathbuilder-button');
    const pathbuilderText = document.getElementById('pathbuilder-text');
    const roll20Button = document.getElementById('roll20-button');
    const roll20Text = document.getElementById('roll20-text');

    // Check for Pathbuilder tabs
    const hasPathbuilderTab = tabs.some(tab => tab.url.includes('pathbuilder2e.com'));

    // Update Pathbuilder status
    if (hasPathbuilderTab) {
        pathbuilderButton.classList.add('active');
        pathbuilderButton.title = 'Pathbuilder page detected';
        pathbuilderText.textContent = 'Page is open';
    } else {
        pathbuilderButton.classList.remove('active');
        pathbuilderButton.title = 'No Pathbuilder page found';
        pathbuilderText.textContent = 'No page open';
    }

    // Check for Roll20 tabs
    const roll20Tabs = tabs.filter(tab => tab.url.includes('app.roll20.net/editor/'));
    const roll20Count = roll20Tabs.length;

    // Update Roll20 status
    if (roll20Count === 0) {
        roll20Button.classList.remove('active', 'warning');
        roll20Button.title = 'No Roll20 page found';
        roll20Text.textContent = 'No page open';
    } else if (roll20Count === 1) {
        roll20Button.classList.add('active');
        roll20Button.classList.remove('warning');
        roll20Button.title = 'Roll20 page detected';
        roll20Text.textContent = 'Page is open';
    } else {
        roll20Button.classList.add('warning');
        roll20Button.classList.remove('active');
        roll20Button.title = 'Multiple Roll20 pages detected';
        roll20Text.textContent = `${roll20Count} pages open`;
    }
});