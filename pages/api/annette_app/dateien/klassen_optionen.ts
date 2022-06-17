import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const WebUntisLib = require("webuntis");

  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf",
    "ajax.webuntis.com"
  );

  await untis.login();
  const classes = await untis.getClasses();
  const classesFmt = [];
  for(const element of classes) {
    const klasse = element;
    classesFmt.push(klasse["name"]);
  }
  res.status(200).json(classesFmt);
}
