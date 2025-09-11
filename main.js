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


// tool tip element
const tooltip = document.createElement('div');
tooltip.className = 'translation-tooltip';
document.body.appendChild(tooltip);



// track the span created for the last clicked sentence/word so it can be deleted
let lastClickedSpan = null;

document.addEventListener('click', (e) => {
  //remove span
  if (lastClickedSpan && lastClickedSpan.parentNode) {
    lastClickedSpan.parentNode.replaceChild(document.createTextNode(lastClickedSpan.textContent), lastClickedSpan);
    lastClickedSpan = null;
  }

  let range, textNode, offset;

  //gets position of the word in the webpage
  if (document.caretPositionFromPoint){ // firefox
    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
    textNode = pos?.offsetNode;
    offset = pos?.offset;
  }
  else if (document.caretRangeFromPoint) {// chrome or safari
    range = document.caretRangeFromPoint(e.clientX, e.clientY);
    textNode = range?.startContainer;
    offset = range?.startOffset;
  }

  //if the clicked thing is text
  //if the clicked thing is text
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const text = textNode.textContent;

    // Find sentence boundaries around the offset
    const leftBoundary = text.slice(0, offset).lastIndexOf(".") + 1; // after last period
    const rightBoundary = text.indexOf(".", offset);

    // If no right period found, take until end
    const sentence =
      rightBoundary === -1
        ? text.slice(leftBoundary).trim()
        : text.slice(leftBoundary, rightBoundary + 1).trim();

    if (sentence) {
      // Style the clicked sentence in the DOM
      const span = document.createElement("span");
      span.className = "clicked-word"; // you may rename class since now it's sentence
      span.textContent = sentence;

      const before = text.slice(0, leftBoundary);
      const after = rightBoundary === -1 ? "" : text.slice(rightBoundary + 1);

      const parent = textNode.parentNode;
      if (parent) {
        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(span);
        if (after) frag.appendChild(document.createTextNode(after));
        parent.replaceChild(frag, textNode);
        lastClickedSpan = span;
      }

      // Send the whole sentence for translation
      chrome.runtime.sendMessage(
        {
          action: "translate",
          text: sentence,
          source: "en", // or "auto"
          target: "es",
        },
        (response) => {
          if (response.result) {
            tooltip.textContent = response.result;
          } else {
            tooltip.textContent = "Error: " + response.error;
          }
        }
      );

      tooltip.style.display = "block";
      const rect = span.getBoundingClientRect();
      tooltip.style.left = window.scrollX + rect.left + "px";
      tooltip.style.top = window.scrollY + rect.bottom + 6 + "px";
    } else {
      tooltip.style.display = "none";
    }
  }
 else {
    tooltip.style.display = 'none';
  }
});
