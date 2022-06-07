const WebUntisLib = require("webuntis");

const untis = new WebUntisLib.WebUntisAnonymousAuth(
  "avdhg-duesseldorf",
  "ajax.webuntis.com"
);

untis
  .login()
  .then(() => {
    return untis.getClasses();
  })
  .then((classes) => {
    // Get timetable for the first class
    return untis.getTimetableForToday(classes[1].id, WebUntisLib.TYPES.CLASS);
  })
  .then((timetable) => {
    console.log(JSON.stringify(timetable));
  });
