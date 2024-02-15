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

  chrome.runtime.sendMessage({event: event, isImportant: isImportant}, (response) => {
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
  existingEvents.forEach((item) => {
    let startDateString = [item.start.dateTime == undefined ? '' : item.start.dateTime.slice(0, 10)];
    if (startDateString == startDate.toISOString().slice(0, 10)) {
      if (item.summary == summary) {
        if (item.colorId == defaultColorId) {
          document.getElementById("gdc-calendar-tool-add-button").innerHTML = "Added to Calendar &#10003";
          document.getElementById("gdc-calendar-tool-add-button").disabled = true;
        }
        else if (item.colorId == importantColorId) {
          document.getElementById("gdc-calendar-tool-add-important-button").innerHTML = `Added to Calendar &#10003`; 
          document.getElementById("gdc-calendar-tool-add-important-button").disabled = true;
        }
      }
    }
    return;
  }) 
};

window.onload = () => {

  var button = document.getElementById('sb5-my-schedule-button');
  if (button == null) {
    console.error('Could not add calendar button to page!');
    return;
  }
  
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

