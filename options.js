const key = "AIzaSyDA6FRM_a0MRLkavTm_NlTnMg6KiCzqUIY";

fetch(`https://www.googleapis.com/calendar/v3/colors?key=${key}`)
  .then(response => response.json())
  .then(data => {
    
  });

// Saves options to chrome.storage
function save_options() {
  var defaultColor = document.getElementById('default-color').value;
  var importantColor = document.getElementById('important-color').value;
  var calendarID = document.getElementById('calendarID').value;
  if (calendarID == undefined || calendarID == '') {
    calendarID = 'primary';
  }

  chrome.storage.sync.set({
    defaultColor: defaultColor,
    importantColor: importantColor,
    calendarID: calendarID
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    defaultColor: 1,
    importantColor: 2,
    calendarID: 'primary'
  }, function(items) {
    document.getElementById('default-color').value = items.defaultColor;
    document.getElementById('important-color').value = items.importantColor;
    
    var calendarID = items.calendarID;
    if (calendarID == 'primary' || calendarID == undefined) {
      calendarID = '';
    }
    document.getElementById('calendarID').value = calendarID;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);