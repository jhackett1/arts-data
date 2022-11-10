import React, { useState } from "react"
import oldData from "./data/old.json"
import newData from "./data/new.json"

enum Filter {
  All = "All",
  More = "Got more",
  Less = "Got less",
  Same = "No difference",
  Gone = "Disappeared from the list",
}

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

const normalise = (raw: string): number =>
  parseInt(raw.replace("£", "").replace(",", ""))

const App = () => {
  const [query, setQuery] = useState<string>("")
  const [filter, setFilter] = useState<Filter>(Filter.All)

  const filteredRecords = oldData.filter(row =>
    row["Applicant Name"].toLowerCase().includes(query.toLowerCase())
  )

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
            {filteredRecords.map((org1, i) => {
              const match = newData.find(
                org2 => org1["Applicant Name"] === org2["Applicant Name"]
              )

              if (filter === Filter.Gone && match) return null

              const oldAward = normalise(org1["Awarded Amount"])
              const newAwardRaw =
                match?.["2023-26 Annual Funding (Offered 4 Nov 2022)"]
              const newAward = newAwardRaw ? normalise(newAwardRaw) : undefined

              const diff = newAward && newAward - oldAward

              if (
                filter === Filter.Same &&
                (typeof diff === "undefined" || diff !== 0)
              )
                return null
              if (
                filter === Filter.More &&
                (typeof diff === "undefined" || diff <= 0)
              )
                return null
              if (
                filter === Filter.Less &&
                (typeof diff === "undefined" || diff >= 0)
              )
                return null

              const oldAwardFormatted = formatter.format(oldAward)
              const newAwardFormatted = newAward && formatter.format(newAward)

              return (
                <tr key={`${org1["Applicant Name"]}-${i}`}>
                  <td>{org1["Applicant Name"]}</td>
                  <td>{oldAwardFormatted}</td>
                  <td>
                    {newAward ? (
                      newAwardFormatted
                    ) : (
                      <span className="nil">-</span>
                    )}
                  </td>
                  <td>
                    {newAward ? (
                      diff && (
                        <>
                          {formatter.format(diff)}{" "}
                          <small>
                            ({diff > 0 && "+"}
                            {Math.floor((diff / oldAward) * 100)}%)
                          </small>
                        </>
                      )
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
        Based on open data from Arts Council England —{" "}
        <a href="https://ff.studio/">ff.studio</a> 2022
      </footer>
    </>
  )
}

export default App
