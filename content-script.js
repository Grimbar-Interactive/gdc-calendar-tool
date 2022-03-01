function parseDaytime(time) {
  let [hours, minutes] = time.match(/[0-1]?[0-9]:[0-5][0-9]/g)[0].split(":").map(Number);
  if (time.includes("pm") && hours !== 12) hours += 12;
  return [("0" + hours).slice(-2), ("0" + minutes).slice(-2)];
}

function addSessionToCalendar(isImportant) {
  // Get name of the session
  let name = document.getElementsByClassName('sb5-session-page-title')[0].innerHTML;

  // Get the location of the session
  let locationString = document.getElementsByClassName('sb5-session-page-location')[0].innerHTML;
  var location = locationString;
  let roomNumber = locationString.match( /[0-9]+/g)[0];
  if (locationString.includes('West')) {
    location = `W${roomNumber}`;
  } else if (locationString.includes('South')) {
    location = `S${roomNumber}`;
  } else if (locationString.includes('North')) {
    location = `N${roomNumber}`; 
  }
  //TODO: Perhaps other locations need to be added? Yerba Buena?

  let descriptionNode = document.getElementsByClassName('sb5-session-page-description')[0];
  let description = Array.from(descriptionNode.children).map(c => c.innerHTML.replace(/<[^>]+>/g, '')).join('\n\n');
  description += `\n\n${document.URL}`;

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
  var startDate = new Date(`${day} March 2022 ${startHours}:${startMinutes}:00 UTC-07:00`);

  var [endHours, endMinutes] = parseDaytime(endTimeString);
  var endDate = new Date(`${day} March 2022 ${endHours}:${endMinutes}:00 UTC-07:00`);

  var event = {
    'summary': name,
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

  chrome.runtime.sendMessage({event: event, isImportant: isImportant}, response => {
    console.log('Message sent.');
  });
}

function clearCache() {
  chrome.runtime.sendMessage({type: 'clear_cache'}, response => {
    console.log('Clearing cache...');
  });
}

window.onload = () => {
  var button = document.getElementById('sb5-my-schedule-button');
  if (button == null) {
    console.error('Could not add calendar button to page!');
    return;
  }
  
  button.insertAdjacentHTML('afterend', '<a class="btn btn-primary sb5_button btn-md btn-block" id="gdc-calendar-tool-add-important-button">Add Important</a>');
  var importantButton = document.getElementById('gdc-calendar-tool-add-important-button');
  importantButton.onclick = () => addSessionToCalendar(true);

  button.insertAdjacentHTML('afterend', '<a class="btn btn-primary sb5_button btn-md btn-block" id="gdc-calendar-tool-add-button">Add to Google Calendar</a>');
  var regularButton = document.getElementById('gdc-calendar-tool-add-button');
  regularButton.onclick = () => addSessionToCalendar(false);
};