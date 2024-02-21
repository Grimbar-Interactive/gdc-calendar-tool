function parseDaytime(time) {
  let [hours, minutes] = time.match(/[0-1]?[0-9]:[0-5][0-9]/g)[0].split(":").map(Number);
  if (time.includes("pm") && hours !== 12) hours += 12;
  return [("0" + hours).slice(-2), ("0" + minutes).slice(-2)];
}

//Get name and time of session (used in both functions below)

let summary = document.getElementsByClassName('sb5-session-page-title')[0].innerHTML;

let timeString = document.getElementsByClassName('sb5-session-page-time')[0].innerHTML;
let timeRegex = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/g;
let times = timeString.match(timeRegex);
var startTimeString = '12:00 am';
var endTimeString = '11:59 pm';
if (times.length >= 2) {
  startTimeString = times[0];
  endTimeString = times[1];
}

var day = parseInt(document.getElementsByClassName('sb5-session-page-date')[0].innerHTML.match(/[1-3]?[0-9]/g)[0]);
var [startHours, startMinutes] = parseDaytime(startTimeString);
var year = new Date().getFullYear();
var startDate = new Date(`${day} March ${year} ${startHours}:${startMinutes}:00 UTC-07:00`);
var dateCompareString = `${year}-03-${day}`;
var [endHours, endMinutes] = parseDaytime(endTimeString);
var endDate = new Date(`${day} March ${year} ${endHours}:${endMinutes}:00 UTC-07:00`);

var defaultColorId;
var importantColorId;

function setDefaultColorId(id) {
  defaultColorId = id;
  console.log("defaultColorId: " + defaultColorId);
}

function setImportantColorId(id) {
  importantColorId = id;
  console.log("importantColorId: " + importantColorId);
}

var eventAdded = '';
var eventFlagged = '';


function addSessionToCalendar(isImportant) {

  // Get the location of the session
  let locationString = document.getElementsByClassName('sb5-session-page-location')[0].innerHTML;
  var location = locationString;

  let roomNumberMatch = locationString.match( /[0-9]+/g);
  if (roomNumberMatch != null) {
    let roomNumber = roomNumberMatch[0];
    if (locationString.includes('West')) {
      location = `W${roomNumber}`;
    } else if (locationString.includes('South')) {
      location = `S${roomNumber}`;
    } else if (locationString.includes('North')) {
      location = `N${roomNumber}`; 
    }
  } else {
    // Has no room number, parse for special locations!
    if (locationString.includes('Virtual GDC Platform')) {
      location = 'Virtual GDC Platform';
    } else if (locationString.includes('GDC Main Stage')) {
      location = 'GDC Main Stage, West Hall';
    } else if (locationString.includes('GDC Industry Stage')) {
      location = 'GDC Industry Stage, Expo Floor, South Hall';
    }
  }

  let descriptionNode = document.getElementsByClassName('sb5-session-page-description')[0];
  let description = Array.from(descriptionNode.children).map(c => c.innerHTML.replace(/<[^>]+>/g, '')).join('\n\n');
  description += `\n\n${document.URL}`;

  var event = {
    'summary': summary,
    'location': location,
    'description': description,
    'start': {
      'dateTime': startDate.toISOString(),
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': endDate.toISOString(),
      'timeZone': 'America/Los_Angeles'
    },
    'reminders': {
      'useDefault': false,
      // 'overrides': [
      //   {'method': 'popup', 'minutes': 10}
      // ]
    }
  };

  if (isImportant) {
    document.getElementById("gdc-calendar-tool-add-important-button").innerHTML = `Adding... <span class="loader"></span>`;
  } else {
    document.getElementById("gdc-calendar-tool-add-button").innerHTML = `Adding... <span class="loader"></span>`;
  }

  console.log('Event ID (content.js): ' + eventAdded);

  chrome.runtime.sendMessage({event: event, isImportant: isImportant, eventId: eventAdded}, (response) => {
    console.log('Message sent.');
    console.log('checking event again');
    chrome.runtime.sendMessage('getCalendarData', (response) => {
    checkEvent(response);
    });
  });
  
}

function clearCache() {
  chrome.runtime.sendMessage({type: 'clear_cache'}, (response) => {
    console.log('Clearing cache...');
  });
}

function checkEvent(calendarData) { 
  if (calendarData == undefined) return;

  let existingEvents = calendarData.items;
  if (existingEvents == undefined) return;

  existingEvents.forEach((item) => {
    if (item.start == undefined) return;
    let startDateString = [item.start.dateTime == undefined ? '' : item.start.dateTime.slice(0, 10)];
    if (startDateString == dateCompareString) {
      if (item.summary == summary) {
        if (item.colorId == defaultColorId) {
          eventAdded = item.id;
          eventFlagged = '';   
        }
        else if (item.colorId == importantColorId) {
          eventAdded = item.id;
          eventFlagged = item.id;
        }
      }
    }
    updateUI();
    return;
  }) 
};

function updateUI() {
  if (eventAdded !== '') {
    document.getElementById("gdc-calendar-tool-add-button").innerHTML = "Added to Calendar &#10003";
    document.getElementById("gdc-calendar-tool-add-important-button").innerHTML = `Flag as Important`; 
    document.getElementById("gdc-calendar-tool-add-button").disabled = true;
    document.getElementById("gdc-calendar-tool-remove-button").style.display = "block";
  }
  if (eventFlagged !== '') {
    document.getElementById("gdc-calendar-tool-add-important-button").innerHTML = `Flagged as Important &#10003`; 
    document.getElementById("gdc-calendar-tool-add-important-button").disabled = true;
  } 
  if (eventAdded == '') {
    document.getElementById("gdc-calendar-tool-add-button").innerHTML = "Add to Google Calendar";
    document.getElementById("gdc-calendar-tool-add-button").disabled = false;
    document.getElementById("gdc-calendar-tool-add-important-button").innerHTML = `Add Important`;
    document.getElementById("gdc-calendar-tool-add-important-button").disabled = false;
    document.getElementById("gdc-calendar-tool-remove-button").innerHTML = "Remove from Calendar";
    document.getElementById("gdc-calendar-tool-remove-button").style.display = "none";
  }
};

function removeSessionFromCalendar() {

  document.getElementById("gdc-calendar-tool-remove-button").innerHTML = `Removing... <span class="loader"></span>`;

  var eventId = eventAdded;
  eventAdded = '';
  eventFlagged = '';
  
  chrome.runtime.sendMessage({event: {"summary": summary}, remove: true, eventId: eventId}, (response) => {
    console.log('Message sent.');
    console.log('checking event again');
    chrome.runtime.sendMessage('getCalendarData', (response) => {
      checkEvent(response);
    });
  });

  
};

window.onload = () => {

  var button = document.getElementById('sb5-my-schedule-button');
  if (button == null) {
    console.error('Could not add calendar button to page!');
    return;
  }
  
  button.insertAdjacentHTML('afterend', '<button class="btn btn-primary sb5_button btn-md btn-block" id="gdc-calendar-tool-remove-button">Remove from Calendar</button>');
  var removeButton = document.getElementById('gdc-calendar-tool-remove-button');
  removeButton.onclick = () => removeSessionFromCalendar();
  removeButton.style.display = "none";

  button.insertAdjacentHTML('afterend', `<button class="btn btn-primary sb5_button btn-md btn-block" id="gdc-calendar-tool-add-important-button">Add Important</button>`);
  var importantButton = document.getElementById('gdc-calendar-tool-add-important-button');
  importantButton.onclick = () => addSessionToCalendar(true);

  button.insertAdjacentHTML('afterend', '<button class="btn btn-primary sb5_button btn-md btn-block" id="gdc-calendar-tool-add-button">Add to Google Calendar</button>');
  var regularButton = document.getElementById('gdc-calendar-tool-add-button');
  regularButton.onclick = () => addSessionToCalendar(false);

  chrome.runtime.sendMessage('getDefaultColorId', (response) => {
    setDefaultColorId(response);
  });

  chrome.runtime.sendMessage('getImportantColorId', (response) => {
    setImportantColorId(response);
  });

  chrome.runtime.sendMessage('getCalendarData', (response) => {
    checkEvent(response);
  })

}

