/**
 * Diese Datei dient dazu, die Klausurpläne der Annette-App zu schicken
 */

import fs from "fs";
import path from "path";

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { klasse } = req.query;

  console.log("datei: " + klasse);

  const filePath = path.resolve(".", `files/annette_app/klausur_${klasse}.pdf`);
  const imageBuffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", "application/pdf"); 
  //* correct "MIME type" is application/pdf
  res.send(imageBuffer);

}