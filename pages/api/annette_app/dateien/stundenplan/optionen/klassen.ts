import { NextApiRequest, NextApiResponse } from "next";
const WebUntisLib = require("webuntis");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //WebUntis initialisieren
  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf", //Schulname
    "ajax.webuntis.com" //Servername, auf dem der Stundenplan liegt
  );
  //Klassen-Array für die Response
  let klassen: string[] = [];

  //Untis-Client initialisieren
  await untis.login();

  //Alle Klassen, die es auf Untis gibt, abfragen
  const classes = await untis.getClasses();

  //Unerwünschte "Fremdkörper" wie ORCHESTER, ABI usw. entfernen bzw. nach Klassenschema filtern
  for (let element of classes) {
    const name = element["name"];
    const klRegex = /^\d+[a-zA-Z]{1}|Q1|Q2|EF$/gm;
    if (klRegex.exec(name)?.length == 1) {
      klassen.push(element["name"]);
    }
  }
   //Klassen zurückgeben
   res.status(200).json(klassen);
   console.log(klassen);

   //Logout (wichtig)
   await untis.logout();
}
