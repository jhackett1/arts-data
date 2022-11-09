import csv from "csvtojson"

const run = async () => {
  const oldData = await csv().fromFile("../data/old.csv")
  const newData = await csv().fromFile("../data/new.csv")

  return [oldData, newData]
}

export default run
