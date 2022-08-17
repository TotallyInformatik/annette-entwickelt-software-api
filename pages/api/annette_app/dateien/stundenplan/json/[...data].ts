import type { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";

//WebUntis-API
const WebUntisLib = require("webuntis");

/**
 * Timegrid mit allen Stunden nach Startuhrzeit
 */
const tmg = new Map<string, string>([
  ["800", "1"],
  ["850", "2"],
  ["935", "3"],
  ["955", "3"],
  ["1045", "4"],
  ["1150", "5"],
  ["1240", "6"],
  ["1335", "7"],
  ["1430", "8"],
  ["1520", "9"],
  ["1610", "10"],
  ["1700", "11"],
]);

/**
 * Der Handler für sämtliche GET-Requests
 * @param req der Request
 * @param res die Response
 * @returns Nichts, aber sendet als Response entweder eine Fehlermeldung oder den Stundenplan mit Code 200
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //Nur GET-Requests erlauben
  if (req.method !== "GET") {
    res.status(405).json({
      error: "Method not allowed",
    });
    return;
  } //ok

  const {
    query: { name, keyword },
    method,
  } = req;

  const cachedResult = cache.get(req.url);
  if (cachedResult) {
    console.log("Serving cached result for", req.url);
    res.status(200).json(cachedResult);
  } else {
    /**
     *  Liste mit allen Klassen, für die der Stundenplan abgefragt werden kann
     */
    let klassen: string[] = [];

    //Anonym anmelden
    const untis = new WebUntisLib.WebUntisAnonymousAuth(
      "avdhg-duesseldorf", //Schulname
      "ajax.webuntis.com" //Servername, auf dem der Stundenplan liegt
    );

    //Untis-Client initialisieren
    await untis.login();

    //Alle Klassen, die es auf Untis gibt, abfragen
    const classes = await untis.getClasses();

    //Alle tatsächlichen Klassen in das Array schreiben
    for (let element of classes) {
      const name = element["name"];
      const klRegex = /^\d+[a-zA-Z]{1}|Q1|Q2|EF$/gm;
      if (klRegex.exec(name)?.length == 1) {
        klassen.push(element["name"]);
      }
    }

    const later = new Date();
    later.setDate(new Date().getDate() + 4);
    cache.put("klassen", klassen, later.getTime() - new Date().getTime());

    const { data } = Array.isArray(req.query) ? req.query[0] : req.query;
    //Da die Parameter entweder nur ein String oder ein String-Array sind, muss hier geprüft werden, worum es sich handelt
    //(TypeScript mag keine uneindeutigen Types)

    const klasse = data[0];
    const datum = data[1] == null ? new Date() : new Date(data[1]);

    //Prüfen, ob die Klasse existiert
    if (!klassen.includes(klasse.toUpperCase())) {
      //Fehlermeldung, falls nicht
      res.status(400).json({ error: "Klasse nicht vorhanden" });
    }
    console.log(data);
    console.log(datum.toString());

    //Timetable der Klasse abfragen, die ausgewählt wurde (für den aktuellen Tag)
    const table = await untis.getTimetableFor(
      datum,
      classes[klassen.indexOf(klasse.toUpperCase())]?.id, //ID der Klasse herausfinden
      WebUntisLib.TYPES.CLASS,
      2
    );

    if (table != "") {
      console.log("<< Table");
    } else {
      console.log("TABLE == NULL OMG NEIN");
    }
    console.log(table);
    let timetableString = ""; //String, der später mit den Informationen gefüllt wird

    let id = 0; //ID des Elements, das gerade bearbeitet wird

    //Durch alle Stunden iterieren
    for (const element of table) {
      const sId = id; //eigentlich egal
      const sKlasse = element?.kl[0]?.name; //Klassenname, z.B. 5A, EF, Q1
      const sLehrer = "XX"; //Lehrerkürzel
      const sFach = element?.su[0]?.name; //Fach, z.B. E GK2
      const sRaum = element?.ro[0] != null ? element.ro[0]?.name : ""; //Falls vorhanden: Raum, z.B. B001, sonst leer, aber nicht null
      const sStunde: string = tmg.get(element?.startTime.toString()) as string; //Stundennummer, z.B. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11

      const date = element["date"]; //Datum der Stunde
      const regex = /^(\d{4})(\d{2})(\d{2})$/; //Regex, um das Datum in Jahr, Monat und Tag zu trennen, Muster: 4 Ziffern, 2 Ziffern, 2 Ziffern
      const matches = regex.exec(date); //Ergebnis der Regex-Auswertung

      console.log(sFach);
      if (sFach != undefined) {
        console.log("pass!");
        //Jahr, Monat und Tag aus dem Ergebnis extrahieren, Date erzeugen und den Wochentag herausfinden
        const sTag =
          matches == null
            ? 1
            : new Date(
                matches[1] + "-" + matches[2] + "-" + matches[3]
              ).getDay(); //z.B. new Date("2020-01-01").getDay()

        //Zeile zusammenfügen und zu String hinzufügen
        const sElement =
          sId +
          "," +
          '"' +
          sKlasse +
          '"' +
          "," +
          '"' +
          sLehrer +
          '"' +
          "," +
          '"' +
          sFach +
          '"' +
          "," +
          '"' +
          sRaum +
          '"' +
          "," +
          sTag +
          "," +
          sStunde +
          "," +
          ",";
        timetableString += sElement;
        id++;
      }
    }

    //put the response into the cache until the next day at 02:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(4);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    cache.put(
      req.url,
      timetableString,
      tomorrow.getTime() - new Date().getTime()
    );
    console.log("<< Cache | " + tomorrow.toString());

    //String als JSON-Response senden
    res.status(200).json(timetableString);
    untis.logout();
  }
}
