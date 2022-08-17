import type { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";

//WebUntis-API
const WebUntisLib = require("webuntis");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({
      error: "Method not allowed",
    });
    return;
  }

  //Anonym anmelden
  const untis = new WebUntisLib.WebUntisAnonymousAuth(
    "avdhg-duesseldorf", //Schulname
    "ajax.webuntis.com" //Servername, auf dem der Stundenplan liegt
  );

  let classes;
  let klassen: string[] = [];

  //Untis-Client initialisieren
  await untis.login();

  //Alle Klassen, die es auf Untis gibt, abfragen
  classes = await untis.getClasses();

  //Alle tatsächlichen Klassen in das Array schreiben
  for (let element of classes) {
    const name = element["name"];
    const klRegex = /^\d+[a-zA-Z]{1}|Q1|Q2|EF$/gm;
    if (klRegex.exec(name)?.length == 1) {
      klassen.push(element["name"]);
    }

    const later = new Date();
    later.setDate(new Date().getDate() + 4);
    cache.put("klassen", klassen, later.getTime() - new Date().getTime());
  }

  const { klasse } = Array.isArray(req.query) ? req.query[0] : req.query;
  //Da die Parameter entweder nur ein String oder ein String-Array sind, muss hier geprüft werden, worum es sich handelt
  //(TypeScript mag keine uneindeutigen Types)

  if (!klassen.includes(klasse.toUpperCase())) {
    res.status(400).json("klasse existiert nicht");
  }

  const table = await untis.getTimetableForWeek(
    new Date(),
    classes[klassen.indexOf(klasse.toUpperCase())].id, //ID der Klasse herausfinden
    WebUntisLib.TYPES.CLASS,
    2
  );
  console.log(table);

  if(klasse.toUpperCase() != "EF" && klasse.toUpperCase() != "Q1" && klasse.toUpperCase() != "Q2") {
  var blocks: any[] = [];
  for (let element of table) {
    blocks.push({
      names: [element.subjects[0]?.element?.name],
      startEnd: element.startTime.toString() + "-" + element.endTime.toString(),
      date: element.date,
    });
  }
  
  var blocks2: any[] = [];
  for (let element of blocks) {
    var found = false;
    for (let element2 of blocks2) {
      if (element.date == element2.date && element.startEnd == element2.startEnd) {
        found = true;
        element2.names.push(element.names[0]);
      }
    }
    if (!found) {
      blocks2.push(element);
    }
  }

  //alles aussortieren, was nur einen eintrag in names hat
  var blocks3: any[] = [];
  for (let element of blocks2) {
    if (element.names.length > 1) {
      blocks3.push(element);
    }
  }

  //alle objekte entfernen, deren erster eintrag von names bereits vertreten ist
  var blocks4: any[] = [];
  for (let element of blocks3) {
    var found = false;
    for (let element2 of blocks4) {
      if (element.names[0] == element2.names[0]) {
        found = true;
      }
    }
    if (!found) {
      blocks4.push(element);
    }
  }
console.log(blocks4);

  const response: any = {};
  response.options = [];
  let idx = 0;
  for (let element of blocks4) {
    response.options[idx] = {
      name: "Option " + idx.toString(),
      options: element.names,
    }
    idx++;
  }

  console.log(response);
  res.status(200).json(response);


  } else {
    //Sek-II-Code
    var schienen: any = {};
    //For every element, get the property lessonText and add it under the corresponding lessonText key in the schienen object
    for (let element of table) {
      let key = element.lessonText;
      key = key.replace(/\, */, "").replace(/LK-Montag*/, "");
      const name = element.subjects[0]?.element?.name;
      if (element.lessonText != null && key != "" && name != undefined && !schienen[key]?.includes(name)) {
        if (schienen[key] == null) {
          schienen[key] = [];
        }
        schienen[key].push(element.subjects[0]?.element?.name);
      }
    }

    schienen['Sport'] = []
    for(let sportkurs = 0; sportkurs < 5; sportkurs++) {
    schienen['Sport'].push("Sport GK" + sportkurs.toString());
    }

    console.log(schienen);
    res.status(200).json(schienen);
  }
  await untis.logout();
}
