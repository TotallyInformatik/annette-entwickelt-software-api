/**
 * Dieser Endpunkt der API sorgt dafür, dass Nachrichten an die Nutzern der Annette-App geschickt werden können
 * 
 * !die Dateien für die Nachrichten sind unter files/annette_app/nachrichten zu finden
 * !die hauptsächliche Nachricht Datei ist als {date}.md bekannt. !muss Markdown sein
 * !Für die erste Version dieser API sollte nur eine Datei im Nachrichten Ordner vorhanden sein...
 * 
 */

import { NextApiRequest, NextApiResponse } from "next";

import path from "path";
import fs from "fs";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const dirPath = path.resolve(".", `files/annette_app/nachrichten/`);
  const fileName = fs.readdirSync(dirPath)[0].split(".")[0]; // trims the .md part
  const filePath = path.resolve(".", `files/annette_app/nachrichten/${fileName}.md`);
  const textBuffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Message-Date", fileName); // fileName tells the user the date.
  res.status(200).send(textBuffer);

}