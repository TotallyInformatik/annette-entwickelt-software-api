// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/**
 * Diese Datei soll nur als Template-Datei dienen, damit man beim Programmieren den Code-Aufbau sich angucken kann.
 * Bitte verändert hieran keinen Code.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}
