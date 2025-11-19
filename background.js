var PORT = "http://localhost:5000/translate";

chrome.runtime.onMessage.addListener(translateMessage);

function translateMessage(message, sender, sendResponse) {
  console.log(`Message received: ${translate.message}`);
  sendResponse({response: "Response from background"});

  /*
  console.log("received");
  if (message.action === "translate") {
    fetch(PORT), {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify({
        q: message.text,
        source: message.source,
        target: message.target,
        format: "text"
      })
    })
      .then(res => res.json())
      .then(data => sendResponse({ result: data.translatedText }))
      .catch(err => sendResponse({error: err.toString() }));
    return true;
  }
  */
  
}
