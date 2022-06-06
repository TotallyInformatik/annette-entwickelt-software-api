import type { NextApiRequest, NextApiResponse } from "next";
import { WebUntisDay, Klasse } from "webuntis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method !== "POST") {
    res.status(405).json({
      error: "Method not allowed"
    });
    return;
  }
  //res.status(200).json({ name: "John Doe" });
  const WebUntisLib = require("webuntis");

  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf",
    "ajax.webuntis.com"
  );

  const body = req.body;
  console.log(body);
  await untis.login();
  const classes = await untis.getClasses();
  const table = await untis.getTimetableFor(new Date("June 08, 2022"), classes[body["id"]].id, WebUntisLib.TYPES.CLASS);
  res.status(200).json(JSON.stringify(table));

}
