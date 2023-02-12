import type { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cachedResult = cache.get("klassen");
  if (cachedResult) {
    console.log("Serving cached result for", req.url);
    res.status(200).json(cachedResult);
  } else {
    const WebUntisLib = require("webuntis");

    const untis = new WebUntisLib.WebUntisAnonymousAuth(
      "avdhg-duesseldorf",
      "ajax.webuntis.com"
    );

    await untis.login();
    const classes = await untis.getClasses();
    const classesFmt = [];
    for (const element of classes) {
      const klasse = element;
      classesFmt.push(klasse["name"]);
    }

    const later = new Date();
    //one week cache
    later.setDate(new Date().getDate() + 7);
    cache.put(
      "klassen",
      classesFmt,
      later.getTime() - new Date().getTime()
    );
    res.status(200).json(classesFmt);
  }
}
