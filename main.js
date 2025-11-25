console.log("Translation hover extension running");

/**
 * @function handleTranslation
 * @description Handles and logs incoming translation from background.js
 * @param {json} text - json from background script
 * returns {void}
 */
function handleTranslation(text){
  console.log(text?.res);
}

/**
 * @function handleTranslationError
 * @description Handles and logs error produced from background.js 
 * @param {Error} Error object
 * returns {void}
 */
function handleTranslationError(error){
  console.log(`Error: ${error}`);
}
/** 
 * Get the highlighted text
 * @function selectionSend 
 * @param {MouseEvent} e - Mouse event object triggered from 'mouseup' action
 * @returns {void}
 * @listens document#mouseup
 */
function selectionSend(e) { 
  let selection = document.getSelection ? document.getSelection().toString() :  document.selection.createRange().toString() ;
  // console.log(`Selection: ${selection}`);
  var response = chrome.runtime.sendMessage({
    translate: selection
  });
  response.then(handleTranslation,handleTranslationError);
}

// when text is highlighted trigger 
document.onmouseup = selectionSend;
