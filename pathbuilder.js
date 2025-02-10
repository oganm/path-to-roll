// Listen for clicks anywhere on the document.
document.addEventListener('click', function(e) {
    // Check if the click occurred inside a skill container.
    const skillElement = e.target.closest('.section-skill');
    if (!skillElement) return; // Not clicking a skill element.

    // Grab the modifier element inside the clicked skill.
    const modifierElement = skillElement.querySelector('.section-skill-total');
    if (!modifierElement) {
      console.warn("Modifier element not found in the clicked skill.");
      return;
    }

    // Get the skill name from the skill element
    const skillNameElement = skillElement.querySelector('.section-skill-name');
    if (!skillNameElement) {
      console.warn("Skill name element not found in the clicked skill.");
      return;
    }

    // Extract and clean up the modifier text.
    let modifier = modifierElement.textContent.trim();
    // Ensure the modifier has a + or - sign.
    if (!modifier.startsWith('+') && !modifier.startsWith('-')) {
      modifier = `+${modifier}`;
    }

    // Get the character name from the specific path
    const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
    const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';
    console.log('Found character name:', charName);
    const skillName = skillNameElement.textContent.trim();

    // Create the roll template string
    const rollString = `&{template:default} {{name=${charName} - ${skillName}}} {{roll=[[1d20${modifier}]]}} {{modifier=${modifier}}}`;

    // Copy the roll string to the clipboard.
    navigator.clipboard.writeText(rollString)
      .then(() => {
        console.log(`Copied roll string: ${rollString}`);
        // Show a pop-up message near the click.
        showPopup(`Copied: ${skillName} check`, e.clientX, e.clientY);

        // Send the roll string to Roll20 through the background script
        console.log('Sending roll string to background...');
        chrome.runtime.sendMessage({
          type: 'ROLL_STRING',
          rollString: rollString
        })
        .then(response => {
          console.log('Background response:', response);
          if (!response || !response.success) {
            console.warn('Failed to process roll:', response?.error || 'No response');
            showPopup('Failed to send to Roll20: ' + (response?.error || 'No response'), e.clientX, e.clientY);
          }
        })
        .catch(err => {
          console.warn('Failed to send roll:', err);
          showPopup('Failed to send to Roll20: ' + err.message, e.clientX, e.clientY);
        });
      })
      .catch(err => {
        console.error('Error copying text: ', err);
        showPopup(`Error copying roll string`, e.clientX, e.clientY);
      });
  });

  // Function to show a temporary pop-up at the click coordinates.
  function showPopup(message, x, y) {
    const popup = document.createElement("div");
    popup.textContent = message;

    // Style the pop-up.
    popup.style.position = "fixed";
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    popup.style.color = "white";
    popup.style.padding = "8px 12px";
    popup.style.borderRadius = "4px";
    popup.style.zIndex = "9999";
    popup.style.opacity = "1";
    popup.style.transition = "opacity 1s ease-out";

    // Append the pop-up to the document.
    document.body.appendChild(popup);

    // Fade out and remove the pop-up after a short time.
    setTimeout(() => {
      popup.style.opacity = "0";
    }, 1000);
    setTimeout(() => {
      popup.remove();
    }, 2000);
  }