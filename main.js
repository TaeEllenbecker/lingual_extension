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

    /* Tooltip styling */
    .translation-tooltip {
      position: absolute;
      background: #B061FF;
      color: #fff;
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 14px;
      z-index: 9999;
      pointer-events: none;
      min-width: 250px;
      min-height: 200px;
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



// Track hovered word
document.addEventListener('mousemove', (e) => {
  let range, textNode, offset;

  if (document.caretPositionFromPoint) { // Firefox, modern
    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
    textNode = pos?.offsetNode;
    offset = pos?.offset;
  } else if (document.caretRangeFromPoint) { // Chrome, Safari
    range = document.caretRangeFromPoint(e.clientX, e.clientY);
    textNode = range?.startContainer;
    offset = range?.startOffset;
  }

  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const text = textNode.textContent;

    // Find word boundaries around the offset
    const left = text.slice(0, offset).search(/\S+$/);
    const right = text.slice(offset).search(/\s/);

    const word = right === -1 ? text.slice(left) : text.slice(left, offset + right);

    if (word && word.trim()) {
      tooltip.textContent = word; // <-- later replace with "translation"
      tooltip.style.display = 'block';
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY + 20 + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  } else {
    tooltip.style.display = 'none';
  }
});

// Hide tooltip when leaving document
document.addEventListener('mouseout', () => {
  tooltip.style.display = 'none';
});
