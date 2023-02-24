const key = "AIzaSyDA6FRM_a0MRLkavTm_NlTnMg6KiCzqUIY";
var currentToken = undefined;

function getAuthToken() {
  return new Promise((resolve) => {
    if (currentToken == undefined) {
      chrome.identity.getAuthToken({interactive: true}, token => {
        currentToken = token;
        resolve(token);
      });
    } else {
      resolve(currentToken);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.event == undefined) {
    console.warn('Received undefined onMessage event.');
    return false;
  }

  getAuthToken()
    .then(token => {
      console.log(`Got token: ${token}`);

      chrome.storage.sync.get({
        defaultColor: 1,
        importantColor: 2,
        calendarID: 'primary'
      }, function(items) {
        var defaultColor = items.defaultColor;
        var importantColor = items.importantColor;
        
        request.event.colorId = request.isImportant ? importantColor : defaultColor;

        var calendarID = items.calendarID;
        if (calendarID == '' || calendarID == undefined) {
          calendarID = 'primary';
        }

        let init = {
          method: 'POST',
          async: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request.event)
        };
    
        fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`, init)
          .then(response => {
            if (response.error != undefined) {
              throw response.error;
            }
            return response.json();
          })
          .then(data => {
            console.log('Success:', JSON.stringify(data));
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      });
    });
  return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type != 'clear_cache') return false;

  chrome.identity.removeCachedAuthToken({token: currentToken}, () => {
    alert('Token cleared.');
  });
  return true;
});