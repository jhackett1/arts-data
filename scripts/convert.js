const csv = require("csvtojson/v2")
const fs = require("fs")

const run = async () => {
  const oldData = await csv().fromFile("src/data/old.csv")
  const newData = await csv().fromFile("src/data/new.csv")

  fs.writeFileSync("src/data/old.json", JSON.stringify(oldData))
  fs.writeFileSync("src/data/new.json", JSON.stringify(newData))

  return [oldData, newData]
}

run()

module.exports = run
