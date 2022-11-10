import csv from "csvtojson/v2"
import fs from "fs"

export interface Row {
  orgName: string
  oldAward: number | null
  newAward: number | null
}

const normalise = (raw: string): number =>
  parseInt(raw.replace("£", "").replaceAll(",", ""))

const run = async (): Promise<void> => {
  const oldRows = await csv().fromFile("src/data/old.csv")
  const newRows = await csv().fromFile("src/data/new.csv")

  const convertedData: Row[] = []

  // 1. add in orgs that appear in the old data, whether they are on the new data or not
  oldRows.forEach(oldRow => {
    const match = newRows.find(
      newRow => newRow["Applicant Name"] === oldRow["Applicant Name"]
    )

    convertedData.push({
      orgName: oldRow["Applicant Name"],
      oldAward: normalise(oldRow["Awarded Amount"]),
      newAward: match
        ? normalise(match["2023-26 Annual Funding (Offered 4 Nov 2022)"])
        : null,
    })
  })

  // 2. add in orgs that only appear in the new data, not the old
  newRows.forEach(newRow => {
    const reverseMatch = oldRows.find(
      oldRow => oldRow["Applicant Name"] === newRow["Applicant Name"]
    )
    if (!reverseMatch) {
      convertedData.push({
        orgName: newRow["Applicant Name"],
        oldAward: null,
        newAward: normalise(
          newRow["2023-26 Annual Funding (Offered 4 Nov 2022)"]
        ),
      })
    }
  })

  fs.writeFileSync("src/data/data.json", JSON.stringify(convertedData))
}

run()
