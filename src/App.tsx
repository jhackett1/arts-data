import React, { useState } from "react"
import data from "./data/data.json"

enum Filter {
  All = "Everything",
  More = "Got more ⬆️",
  Less = "Got less ⬇️",
  Same = "Same as last time 😐",
  Gone = "Got nothing ☹️",
  New = "New awards 🙂",
}

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

const toPercentage = (numerator: number, denominator: number): string => {
  const decimal = numerator / denominator
  if (decimal !== 0)
    return `(${decimal > 0 ? "+" : ""}${Math.floor(decimal * 100)}%)`
  return ""
}

const diffClass = (diff: number): string => {
  if (diff > 0) return "percentage--positive"
  if (diff < 0) return "percentage--negative"
  return ""
}

const App = () => {
  const [query, setQuery] = useState<string>("")
  const [filter, setFilter] = useState<Filter>(Filter.All)

  const totalOld = data.reduce<number>(
    (acc, row) => (row?.oldAward ? acc + row.oldAward : acc),
    0
  )
  const totalNew = data.reduce<number>(
    (acc, row) => (row?.newAward ? acc + row.newAward : acc),
    0
  )
  const totalDiff = totalNew - totalOld

  const filteredRecords = data
    .filter(row => row.orgName.toLowerCase().includes(query.toLowerCase()))
    .filter(row => {
      if (filter === Filter.New) return !row.oldAward

      if (filter === Filter.More)
        return row?.oldAward && row?.newAward && row?.oldAward < row?.newAward

      if (filter === Filter.Less)
        return row?.oldAward && row?.newAward && row?.oldAward > row?.newAward

      if (filter === Filter.Same)
        return row?.oldAward && row?.newAward && row?.oldAward === row?.newAward

      if (filter === Filter.Gone) return row.newAward === null

      return true
    })

  return (
    <>
      <form>
        <div>
          <label htmlFor="search">Search by organisation:</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <fieldset>
          <legend>Show only:</legend>

          {Object.entries(Filter).map(f => (
            <div key={f[0]} className="radio">
              <input
                id={`filter-${f[1]}`}
                type="radio"
                name="filter"
                checked={f[1] === filter}
                value={f[1]}
                onChange={e => setFilter(e.target.value as Filter)}
              />
              <label htmlFor={`filter-${f[1]}`}>{f[1]}</label>
            </div>
          ))}
        </fieldset>
      </form>

      {filteredRecords.length > 0 && (
        <small className="record-count">
          Showing {filteredRecords.length} results
        </small>
      )}

      {filteredRecords.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th scope="col">Organisation</th>
              <th scope="col">Old award</th>
              <th scope="col">New award</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {!query && filter === Filter.All && (
              <tr className="totals">
                <td>All organisations</td>
                <td>{formatter.format(totalOld)}</td>
                <td>{formatter.format(totalNew)}</td>
                <td>
                  {formatter.format(totalDiff)}{" "}
                  <small className={diffClass(totalDiff)}>
                    {toPercentage(totalDiff, totalOld)}
                  </small>
                </td>
              </tr>
            )}

            {filteredRecords.map((row, i) => {
              const diff =
                row.newAward && row.oldAward && row.newAward - row.oldAward

              return (
                <tr key={`${row.orgName}-${i}`}>
                  <td>{row.orgName}</td>
                  <td>
                    {row.oldAward === null ? (
                      <span className="nil">-</span>
                    ) : (
                      formatter.format(row.oldAward)
                    )}
                  </td>
                  <td>
                    {row.newAward === null ? (
                      <span className="nil">-</span>
                    ) : (
                      formatter.format(row.newAward)
                    )}
                  </td>
                  <td>
                    {diff !== null && row.oldAward ? (
                      <>
                        {formatter.format(diff)}{" "}
                        <small className={diffClass(diff)}>
                          {toPercentage(diff, row.oldAward)}
                        </small>
                      </>
                    ) : (
                      <span className="nil">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-results">No results</p>
      )}

      <footer>
        Based on open data from Arts Council England ·{" "}
        <a href="https://github.com/jhackett1/arts-data">Github source</a> ·{" "}
        <a href="https://ff.studio/">ff.studio</a> 2022
      </footer>
    </>
  )
}

export default App
