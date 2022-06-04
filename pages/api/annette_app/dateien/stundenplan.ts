import { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";

/**
 * @param req ..
 * @param res ..
 * 
 * gibt die stundenplan.TXT Datei als Response zurück
 * 
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const filePath = path.resolve(".", `files/annette_app/stundenplan.TXT`);
  const textBuffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", "text/TXT"); 
  res.status(200).send(textBuffer);

}