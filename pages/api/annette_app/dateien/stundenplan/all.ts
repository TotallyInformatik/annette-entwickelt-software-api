import { readFileSync } from "fs";

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const file = readFileSync("./files/annette_app/stundenplan.txt", "utf-8");
  res.status(200).json({ name: file });
}
