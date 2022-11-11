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
      <a href="https://ff.studio">
        <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
          <path
            d="M7.73864 5.95172H5.01989V4.92047C5.01989 3.89774 5.44602 3.32672 6.59659 3.32672C7.08239 3.32672 7.49148 3.43751 7.74716 3.51422L8.36932 1.12785C7.96875 0.991489 7.09091 0.769897 6.02557 0.769897C3.75 0.769897 1.93466 2.07388 1.93466 4.71592V5.95172H0V8.33808H1.93466V19.0426H5.01989V8.33808H7.73864V5.95172Z"
            fill="#333333"
          />
          <path
            d="M16.7855 5.95172H14.0668V4.92047C14.0668 3.89774 14.4929 3.32672 15.6435 3.32672C16.1293 3.32672 16.5384 3.43751 16.794 3.51422L17.4162 1.12785C17.0156 0.991489 16.1378 0.769897 15.0724 0.769897C12.7969 0.769897 10.9815 2.07388 10.9815 4.71592V5.95172H9.04688V8.33808H10.9815V19.0426H14.0668V8.33808H16.7855V5.95172Z"
            fill="#333333"
          />
          <path
            d="M19.7429 19.2301C20.7486 19.2301 21.6094 18.3949 21.6179 17.3551C21.6094 16.3324 20.7486 15.4972 19.7429 15.4972C18.7031 15.4972 17.8594 16.3324 17.8679 17.3551C17.8594 18.3949 18.7031 19.2301 19.7429 19.2301Z"
            fill="#333333"
          />
        </svg>
        <span className="visually-hidden">ff.studio</span>
      </a>

      <h1>Explore Arts Council funding data</h1>
      <p className="intro">
        Arts Council England{" "}
        <a href="https://www.artscouncil.org.uk/investment23">
          announced funding distribution
        </a>{" "}
        for 2023-2026 in November 2022.
      </p>

      <p className="intro">
        This is a list of organisations and how much funding they got this time
        compared to the last round from 2018-2022. Some organisations didn’t
        apply for funding this time around, others were not awarded any funding. We aren’t
        differentiating between those at the moment.
      </p>
      <p className="intro">
        We made this because we heard that it was challenging to compare between
        the two funding rounds. If you think it’s useful, have feedback, or
        suggestions for things you’d like to see, email us on{" "}
        <a href="mailto:artsfunding@ff.studio">artsfunding@ff.studio</a>.
      </p>
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
              <th scope="col">2018 (per year)</th>
              <th scope="col">2023 (per year)</th>
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
        <a href="https://github.com/jhackett1/arts-data">GitHub source</a> ·{" "}
        <a href="https://ff.studio/">ff.studio</a> 2022
      </footer>
    </>
  )
}

export default App
