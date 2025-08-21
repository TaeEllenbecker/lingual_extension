console.log("Translation hover extension running");

// Function to inject hover style
function injectSubtitleStyle() {
  if (!document.head) {
    requestAnimationFrame(injectSubtitleStyle);
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .ytp-caption-segment:hover {
      cursor: pointer;
      color: #B061FF !important;
      font-weight: bold !important;
      transition: color 0.3s ease;
    }

    /*Clicked word Styling*/
    .clicked-word{
    background-color: rgba(176, 97, 255, .6);
    border-radius: 5px;
    }

    /* Tooltip styling */
    .translation-tooltip {
      position: absolute;
      background: #B061FF;
      color: black;
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 14px;
      z-index: 9999;
      pointer-events: none;
      max-width: 250px;
      max-height: 200px;
      display: none;
    }
  `;
  document.head.appendChild(style);
}

injectSubtitleStyle();


// Create tooltip element
const tooltip = document.createElement('div');
tooltip.className = 'translation-tooltip';
document.body.appendChild(tooltip);



// Track the last created span so it can be removed on the next click
let lastClickedSpan = null;
document.addEventListener('click', (e) => {
  // Remove the previous span if it exists
  if (lastClickedSpan && lastClickedSpan.parentNode) {
    lastClickedSpan.parentNode.replaceChild(document.createTextNode(lastClickedSpan.textContent), lastClickedSpan);
    lastClickedSpan = null;
  }

  let range, textNode, offset;

  //gets position of the word in the webpage
  if (document.caretPositionFromPoint) { // Firefox, modern
    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
    textNode = pos?.offsetNode;
    offset = pos?.offset;
  } else if (document.caretRangeFromPoint) { // Chrome, Safari
    range = document.caretRangeFromPoint(e.clientX, e.clientY);
    textNode = range?.startContainer;
    offset = range?.startOffset;
  }

  //if the clicked thing is text
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    //the actual texts content
    const text = textNode.textContent;

    // Find word boundaries around the offset
    const left = text.slice(0, offset).search(/\S+$/);
    const right = text.slice(offset).search(/\s/);

    //single out the word
    const word = right === -1 ? text.slice(left) : text.slice(left, offset + right);

    if (word && word.trim()) {
      //style the clicked word in the dom
      const span = document.createElement('span');
      span.className = 'clicked-word';
      span.textContent = word;

      // Split the text node into before, word, after
      const before = text.slice(0, left);
      const after = right === -1 ? '' : text.slice(offset + right);

      // Replace the text node with the new nodes
      const parent = textNode.parentNode;
      if (parent) {
        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(span);
        if (after) frag.appendChild(document.createTextNode(after));
        parent.replaceChild(frag, textNode);
        lastClickedSpan = span;
      }

      //pop up the tooltip with info
      chrome.runtime.sendMessage(
        {
          action: "translate",
          text: word,
          source: "en",   // or "auto" if you want LibreTranslate to auto-detect
          target: "ko"
        },
        (response) => {
          if (response.result) {
            tooltip.textContent = response.result;
          } else {
            tooltip.textContent = "Error: " + response.error;
          }
        }
      );

      tooltip.style.display = 'block';
      const rect = span.getBoundingClientRect();
      tooltip.style.left = window.scrollX + rect.left + 'px';
      tooltip.style.top = window.scrollY + rect.bottom + 6 + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  } else {
    tooltip.style.display = 'none';
  }
});
