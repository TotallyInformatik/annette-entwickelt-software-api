/**
 * Diese Datei dient dazu, die Klausurpläne der Annette-App zu schicken
 */

import fs from "fs";
import path from "path";

import { NextApiRequest, NextApiResponse } from "next";

/**
 * @param req ..
 * @param res ..
 * 
 * falls die "query" ef, q1 oder q2 ist, dann wird der entsprechende Klausurplan geschickt
 * 
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const validClasses = ["ef", "q1", "q2"];
  const { grade } = req.query;

  if (!validClasses.includes(grade.toString())) {
    res.status(404).json({message: "no such file"});
    return;
  }

  const filePath = path.resolve(".", `files/annette_app/exam_${grade}.pdf`);
  const imageBuffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", "application/pdf"); 
  //* correct "MIME type" is application/pdf
  res.status(200).send(imageBuffer);
  return;

}