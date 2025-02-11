// Function to update the CSS based on tinting preference
function updateTintingCSS(blockTinting) {
    // Remove any existing style element
    const existingStyle = document.getElementById('tinting-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'tinting-style';

    // Only add the CSS if blocking is enabled
    if (blockTinting) {
        style.textContent = `
            body > div.dice-tray,
            #dice-backdrop {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
    }
    document.head.appendChild(style);
}

// Initialize tinting preference from storage
chrome.storage.sync.get(['blockTinting'], function(result) {
    // Default to true if not set
    updateTintingCSS(result.blockTinting !== false);
});

// Listen for preference updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_TINTING') {
        updateTintingCSS(message.blockTinting);
    }
});

// Listen for clicks anywhere on the document.
document.addEventListener('click', function(e) {
    // Check if the click occurred inside a skill container.
    const skillElement = e.target.closest('.section-skill');
    if (!skillElement) return; // Not clicking a skill element.

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            // Only prevent default and stop propagation if blocking is enabled
            e.preventDefault();
            e.stopPropagation();
        }

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

        // Handle roll string copying and sending
        handleRollString(rollString, `${skillName} check`, e.clientX, e.clientY);
    });
});

// Listen for clicks on attack elements
document.addEventListener('click', function(e) {
    // Check if we clicked on or inside the attack tooltip (with d20 icon)
    const hitElement = e.target.closest('.tooltip');
    if (!hitElement || !hitElement.querySelector('img.icon-dice')) return;

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            // Only prevent default and stop propagation if blocking is enabled
            e.preventDefault();
            e.stopPropagation();
        }

        // Get the base attack bonus (text node after Hit:)
        const hitDiv = hitElement.querySelector('.weapon-hit');
        if (!hitDiv) {
            console.warn("Hit div not found.");
            return;
        }

        let attackBonus = '';
        const hitSpan = hitDiv.querySelector('.weapon-span');
        if (hitSpan) {
            const nextNode = hitSpan.nextSibling;
            if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                attackBonus = nextNode.textContent.trim();
            }
        }

        if (!attackBonus) {
            console.warn("Attack bonus not found.");
            return;
        }

        // Ensure the bonus has a + or - sign
        if (!attackBonus.startsWith('+') && !attackBonus.startsWith('-')) {
            attackBonus = `+${attackBonus}`;
        }

        // Get the weapon name from the parent container
        const weaponNameElement = hitElement.parentElement.querySelector('.weapon-name');
        const weaponName = weaponNameElement ? weaponNameElement.textContent.trim() : 'Attack';

        // Get proficiency level from the icon
        const profIcon = hitElement.parentElement.querySelector('img[src*="icon_prof_"]');
        let profLevel = '';
        if (profIcon) {
            if (profIcon.src.includes('trained')) profLevel = 'Trained';
            else if (profIcon.src.includes('expert')) profLevel = 'Expert';
            else if (profIcon.src.includes('master')) profLevel = 'Master';
            else if (profIcon.src.includes('legendary')) profLevel = 'Legendary';
        }

        // Get weapon traits
        const weaponContainer = hitElement.closest('.weapon-container');
        const traitsDiv = weaponContainer ? weaponContainer.querySelector('.weapon-traits') : null;
        const traits = [];
        if (traitsDiv) {
            traitsDiv.querySelectorAll('.trait').forEach(trait => {
                traits.push(trait.textContent.trim());
            });
        }
        const traitsText = traits.length > 0 ? traits.join(', ') : '';

        // Get the character name
        const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
        const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';

        // Create the roll template string for attack
        const rollString = `&{template:default} {{name=${charName} - ${weaponName} Attack}} {{attack=[[1d20${attackBonus}]]}}${profLevel ? ` {{proficiency=${profLevel}}}` : ''}${traitsText ? ` {{traits=${traitsText}}}` : ''}`;

        // Handle roll string copying and sending
        handleRollString(rollString, 'Attack roll', e.clientX, e.clientY);
    });
});

// Listen for clicks on damage elements
document.addEventListener('click', function(e) {
    // Check if we clicked on or inside the damage tooltip (with damage dice icon)
    const damageElement = e.target.closest('.tooltip');
    if (!damageElement || !damageElement.querySelector('img.icon-damage-dice')) return;

    // Stop event propagation to prevent double-handling
    e.stopPropagation();

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            // Only prevent default and stop propagation if blocking is enabled
            e.preventDefault();
            e.stopPropagation();
        }

        // Get the damage roll string from the weapon-span
        const damageSpan = damageElement.querySelector('span');
        if (!damageSpan) {
            console.warn("Damage span not found in the clicked element.");
            return;
        }

        // Find the text node containing the dice formula (it's right after the weapon-span)
        let diceNode = null;
        for (const node of damageSpan.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                diceNode = node;
                break;
            }
        }

        if (!diceNode) {
            console.warn("Dice formula text node not found.");
            return;
        }

        // Extract just the dice formula, removing any whitespace
        const damageText = diceNode.textContent.trim();
        if (!damageText) {
            console.warn("Dice formula is empty.");
            return;
        }

        // Get critical multiplier if it exists
        const critSpan = damageSpan.querySelector('.tooltiptextCrit');
        const critMatch = critSpan ? critSpan.textContent.match(/Critical\s*(\d+x):/) : null;
        const critText = critMatch ? critMatch[1] : null;

        // Get damage type if it exists
        const damageTypeSpan = damageSpan.querySelector('.superscript-damage');
        const damageType = damageTypeSpan ? damageTypeSpan.textContent.trim() : null;

        // Get the weapon name from the parent container
        const weaponNameElement = damageElement.parentElement.querySelector('.weapon-name');
        const weaponName = weaponNameElement ? weaponNameElement.textContent.trim() : 'Attack';

        // Get the character name
        const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
        const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';

        // Create the roll template string for damage, including critical multiplier and damage type if available
        const rollString = `&{template:default} {{name=${charName} - ${weaponName} Damage}} {{damage=[[${damageText}]]}}${damageType ? ` {{type=${damageType}}}` : ''}${critText ? ` {{critical=${critText}}}` : ''}`;

        // Handle roll string copying and sending
        handleRollString(rollString, 'Damage roll', e.clientX, e.clientY);
    });
});

// Listen for clicks on spell attack elements
document.addEventListener('click', function(e) {
    // Check if we clicked on a spell attack roll button
    const spellElement = e.target.closest('.dice-button.named-roll');
    if (!spellElement || !spellElement.textContent.includes('Spell Attack')) return;

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Get the attack bonus from the data-roll-value attribute
        const rollValue = spellElement.getAttribute('data-roll-value');
        if (!rollValue) {
            console.warn("Roll value not found.");
            return;
        }

        // Get the spell name from the data-title attribute or the closest title element
        const spellTitle = spellElement.closest('.listview-item').querySelector('.listview-title');
        const spellName = spellTitle ? spellTitle.textContent.trim() : 'Spell';

        // Get spell traits
        const traitsDiv = spellElement.closest('.listview-detail').querySelector('div:has(> .trait)');
        const traits = [];
        if (traitsDiv) {
            traitsDiv.querySelectorAll('.trait').forEach(trait => {
                traits.push(trait.textContent.trim());
            });
        }
        const traitsText = traits.length > 0 ? traits.join(', ') : '';

        // Get the character name
        const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
        const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';

        // Create the roll template string for spell attack
        const rollString = `&{template:default} {{name=${charName} - ${spellName} Attack}} {{attack=[[${rollValue}]]}}${traitsText ? ` {{traits=${traitsText}}}` : ''}`;

        // Handle roll string copying and sending
        handleRollString(rollString, 'Spell Attack roll', e.clientX, e.clientY);
    });
});

// Listen for clicks on spell damage elements
document.addEventListener('click', function(e) {
    // Check if we clicked on a spell damage roll button (dice-button that's not a spell attack)
    const spellElement = e.target.closest('.dice-button.named-roll');
    if (!spellElement || spellElement.textContent.includes('Spell Attack')) return;

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Get the damage roll from the data-roll-value attribute
        const rollValue = spellElement.getAttribute('data-roll-value');
        if (!rollValue) {
            console.warn("Roll value not found.");
            return;
        }

        // Get the spell name from the closest title element
        const spellTitle = spellElement.closest('.listview-item').querySelector('.listview-title');
        const spellName = spellTitle ? spellTitle.textContent.trim() : 'Spell';

        // Get spell traits
        const traitsDiv = spellElement.closest('.listview-detail').querySelector('div:has(> .trait)');
        const traits = [];
        if (traitsDiv) {
            traitsDiv.querySelectorAll('.trait').forEach(trait => {
                traits.push(trait.textContent.trim());
            });
        }
        const traitsText = traits.length > 0 ? traits.join(', ') : '';

        // Get spell description to find damage type
        const description = spellElement.getAttribute('data-description');
        let damageType = null;
        if (description) {
            // Look for damage types in the description
            const damageTypes = ['bludgeoning', 'piercing', 'slashing', 'fire', 'cold', 'acid', 'electricity', 'sonic', 'force', 'mental', 'poison', 'positive', 'negative'];
            for (const type of damageTypes) {
                if (description.toLowerCase().includes(type)) {
                    damageType = type.charAt(0).toUpperCase() + type.slice(1);
                    break;
                }
            }
        }

        // Get the character name
        const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
        const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';

        // Create the roll template string for spell damage
        const rollString = `&{template:default} {{name=${charName} - ${spellName} Damage}} {{damage=[[${rollValue}]]}}${damageType ? ` {{type=${damageType}}}` : ''}${traitsText ? ` {{traits=${traitsText}}}` : ''}`;

        // Handle roll string copying and sending
        handleRollString(rollString, 'Spell Damage roll', e.clientX, e.clientY);
    });
});

// Listen for clicks on ability score modifiers
document.addEventListener('click', function(e) {
    // Check if we clicked on an ability modifier
    const abilityElement = e.target.closest('.ability-span');
    if (!abilityElement) return;

    // Get the current tinting preference before handling the click
    chrome.storage.sync.get(['blockTinting'], function(result) {
        const blockTinting = result.blockTinting !== false;

        if (blockTinting) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Get the ability label and modifier
        const abilityLabel = abilityElement.querySelector('.abilityLabel');
        const abilityMod = abilityElement.querySelector('.abilityMod');

        if (!abilityLabel || !abilityMod) {
            console.warn("Ability label or modifier not found.");
            return;
        }

        const ability = abilityLabel.textContent.trim();
        let modifier = abilityMod.textContent.trim();

        // Get the character name
        const charNameElement = document.querySelector("#container-row-0-col-0 > div.section-top.rounded-rectangle > div > div:nth-child(1) > div:nth-child(4) > div > div.button-selection.button-text");
        const charName = charNameElement ? charNameElement.textContent.trim() : 'Unknown Character';

        // Create the roll template string for ability check
        const rollString = `&{template:default} {{name=${charName} - ${ability} Check}} {{roll=[[1d20${modifier}]]}} {{modifier=${modifier}}}`;

        // Handle roll string copying and sending
        handleRollString(rollString, `${ability} Check`, e.clientX, e.clientY);
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

// Debug function to log HTML structure
function logHTMLStructure(element) {
    console.log('HTML Structure:', element.outerHTML);
}

// Function to handle roll string copying and sending
function handleRollString(rollString, description, x, y) {
    // Get the clipboard preference
    chrome.storage.sync.get(['copyToClipboard'], function(result) {
        const shouldCopy = result.copyToClipboard === true;

        const actions = [];

        // Only copy to clipboard if enabled
        if (shouldCopy) {
            actions.push(
                navigator.clipboard.writeText(rollString)
                    .then(() => {
                        console.log(`Copied roll string: ${rollString}`);
                    })
                    .catch(err => {
                        console.error('Error copying text: ', err);
                    })
            );
        }

        // Always send to Roll20
        actions.push(
            chrome.runtime.sendMessage({
                type: 'ROLL_STRING',
                rollString: rollString
            })
            .then(response => {
                console.log('Background response:', response);
                if (!response || !response.success) {
                    console.warn('Failed to process roll:', response?.error || 'No response');
                    showPopup('Failed to send to Roll20: ' + (response?.error || 'No response'), x, y);
                }
            })
            .catch(err => {
                console.warn('Failed to send roll:', err);
                showPopup('Failed to send to Roll20: ' + err.message, x, y);
            })
        );

        // Execute all actions
        Promise.all(actions)
            .then(() => {
                // Only show the "Copied" message if clipboard copying is enabled
                if (shouldCopy) {
                    showPopup(`Copied: ${description}`, x, y);
                } else {
                    showPopup(`Sent to Roll20: ${description}`, x, y);
                }
            });
    });
}