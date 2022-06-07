import { assert } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { WebUntisDay, Klasse } from "webuntis";

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
 


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({
      error: "Method not allowed",
    });
    return;
  }

  //res.status(200).json({ name: "John Doe" });
  const WebUntisLib = require("webuntis");

  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf",
    "ajax.webuntis.com"
  );

  const { klasse } = Array.isArray(req.query) ? req.query[0] : req.query;

  if (!klassen.includes(klasse.toUpperCase())) {
    res.status(400).json({ error: "Klasse nicht vorhanden" });
  }

  console.log(klasse.toUpperCase());
  await untis.login();
  const classes = await untis.getClasses();
  const grid = await untis.getTimegrid();
  const table = await untis.getTimetableFor(
    new Date("June 08, 2022"),
    classes[klassen.indexOf(klasse.toUpperCase())].id,
    WebUntisLib.TYPES.CLASS
  );

  //98,"9B","GO","D","H004",4,1,,

  let timetableString = "";
  for(const element of table) {
    const sId = "0";
    const sKlasse = element.kl[0].name;
    const sLehrer = element.te[0].name;
    const sFach = element.su[0].name;
    const sRaum = (element.ro[0] != null) ? element.ro[0].name : "";
    const sStunde: string = tmg.get(element.startTime.toString()) as string;

    const date = element["date"];
    const regex = /^(\d{4})(\d{2})(\d{2})$/;
    const matches = regex.exec(date);

    const sTag = (matches == null) ? -1 : new Date(matches[1] + "-" + matches[2] + "-" + matches[3]).getDay();
    if(matches == null) {
      res.status(500).json("Bad date");
    }
    const sElement = sId + "," + sKlasse + "," + sLehrer + "," + sFach + "," + sRaum + "," + sStunde + "," + sTag + ",";
    timetableString += sElement;
  }

  res.status(200).json(timetableString);
  
  /* 
  
  {
    "id": 401340,
    "date": 20220608,
    "startTime": 1150,
    "endTime": 1235,
    "kl": [
      {
        "id": 132,
        "name": "Q1",
        "longname": "HEISLER / HENZE"
      }
    ],
    "te": [
      {
        "id": 140,
        "name": "HN",
        "longname": "HÖSGEN"
      }
    ],
    "su": [
      {
        "id": 140,
        "name": "CH GK1",
        "longname": "CHEMIE Grundkurs"
      }
    ],
    "ro": [
      {
        "id": 220,
        "name": "D107",
        "longname": "Chemie 2"
      }
    ],
    "lstext": "GK-Schiene 6",
    "lsnumber": 82400,
    "sg": "CHGK1_Q1",
    "activityType": "Unterricht"
  },

  */
}
