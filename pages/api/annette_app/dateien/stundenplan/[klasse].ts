import type { NextApiRequest, NextApiResponse } from "next";

/**
 *  Liste mit allen Klassen, für die der Stundenplan abgefragt werden kann
 */
const klassen = [
  "5A",
  "5B",
  "5C",
  "5D",
  "5E",
  "6A",
  "6B",
  "6C",
  "6D",
  "6F",
  "7A",
  "7B",
  "7C",
  "7D",
  "7F",
  "8A",
  "8B",
  "8C",
  "8D",
  "8E",
  "9A",
  "9B",
  "9C",
  "9D",
  "9E",
  "EF",
  "Q1",
  "Q2",
];

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
  }

  const {
    query: { name, keyword },
    method,
  } = req;

  //WebUntis-API
  const WebUntisLib = require("webuntis");

  //Anonym anmelden
  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf", //Schulname
    "ajax.webuntis.com" //Servername, auf dem der Stundenplan liegt
  );

  const { klasse } = Array.isArray(req.query) ? req.query[0] : req.query;
  //Da die Parameter entweder nur ein String oder ein String-Array sind, muss hier geprüft werden, worum es sich handelt
  //(TypeScript mag keine uneindeutigen Types)

  //Prüfen, ob die Klasse existiert
  if (!klassen.includes(klasse.toUpperCase())) {
    //Fehlermeldung, falls nicht
    res.status(400).json({ error: "Klasse nicht vorhanden" });
  }

  /*
    * Debug: Klasse ausgeben
  console.log(klasse.toUpperCase());
  */

  //Untis-Client initialisieren
  await untis.login();

  //Alle Klassen, die es auf Untis gibt, abfragen
  //TODO: klassen-Array mit untis.getClasses() ersetzen
  const classes = await untis.getClasses();

  //Timetable der Klasse abfragen, die ausgewählt wurde (für den aktuellen Tag)
  const table = await untis.getTimetableForToday(
    classes[klassen.indexOf(klasse.toUpperCase())].id, //ID der Klasse herausfinden
    WebUntisLib.TYPES.CLASS
  );

  let timetableString = ""; //String, der später mit den Informationen gefüllt wird

  let id = 0; //ID des Elements, das gerade bearbeitet wird

  //Durch alle Stunden iterieren
  for(const element of table) {
    const sId = id; //eigentlich egal
    const sKlasse = element.kl[0].name; //Klassenname, z.B. 5A, EF, Q1
    const sLehrer = element.te[0].name; //Lehrerkürzel
    const sFach = element.su[0].name; //Fach, z.B. E GK2
    const sRaum = (element.ro[0] != null) ? element.ro[0].name : ""; //Falls vorhanden: Raum, z.B. B001, sonst leer, aber nicht null
    const sStunde: string = tmg.get(element.startTime.toString()) as string; //Stundennummer, z.B. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11

    const date = element["date"]; //Datum der Stunde
    const regex = /^(\d{4})(\d{2})(\d{2})$/; //Regex, um das Datum in Jahr, Monat und Tag zu trennen, Muster: 4 Ziffern, 2 Ziffern, 2 Ziffern
    const matches = regex.exec(date); //Ergebnis der Regex-Auswertung

    //Jahr, Monat und Tag aus dem Ergebnis extrahieren, Date erzeugen und den Wochentag herausfinden
    const sTag = (matches == null) ? -1 : new Date(matches[1] + "-" + matches[2] + "-" + matches[3]).getDay(); //z.B. new Date("2020-01-01").getDay()
    //Fehlermeldung, falls das Date keinen Sinn ergibt oder null ist
    if(matches == null) {
      res.status(500).json("Bad date");
    }
    //Zeile zusammenfügen und zu String hinzufügen
    const sElement = sId + "," + '"' + sKlasse + '"' + "," + '"' + sLehrer + '"' + "," + '"' + sFach + '"' + "," + '"' + sRaum + '"' + "," + sTag + "," + sStunde + "," + ",";
    timetableString += sElement;
    id++;
  }

  //String als JSON-Response senden
  res.status(200).json(timetableString);
}
