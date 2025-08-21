chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translate") {
    fetch("http://localhost:5000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: message.text,
        source: message.source,
        target: message.target,
        format: "text"
      })
    })
      .then(res => res.json())
      .then(data => sendResponse({ result: data.translatedText }))
      .catch(err => sendResponse({ error: err.toString() }));

    return true; // keep the channel open for async response
  }
});
