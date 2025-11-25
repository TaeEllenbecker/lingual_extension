/**
 * @file background.js
 * @description Listens for messages from the content script 
 * to initiate a translation request.
 */

var PORT = "http://localhost:5000/translate";
/**
 * @function onMessageListener
 * @description Listener function for incoming messages from main.js 
 * Translates the incoming selection using LibreTranslate PORT
 * and sends the result back to main.js
 * @param {selection} message - The message object containing the text 
 * to be translated.
 * @param {object} sender - An object containing information about the
 * sender of the message.
 * @param {function} sendResponse - Function to call to send a response 
 * back to the message sender.
 * @returns {boolean} Returns true to indicate that the response will be 
 * sent asynchronously.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
  console.log("In background script");

  const response = await fetch(PORT, {
    method: "POST",
    body: JSON.stringify({
      q: message.translate,
      source: "en",
      target: "it"
    }),
    headers: { "Content-Type": "application/json" },
  });
 
  const data = await response.json();
  
  const text = data.translatedText;
  console.log(text);
  // send response to main.js
  sendResponse( {res : text} );
  })();
  
  return true;
});
