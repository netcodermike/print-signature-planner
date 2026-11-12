import { readFileSync } from 'node:fs'

function analyze({pages, pagesPerSignature}) {
  if (!Number.isInteger(pages) || pages < 1 || pages > 10000 ||
      !Number.isInteger(pagesPerSignature) || pagesPerSignature < 4 || pagesPerSignature > 128 || pagesPerSignature % 4) {
    throw new Error('Expected 1–10000 pages and a signature size of 4–128 divisible by four')
  }
  let blankPages = 0
  const layout = []
  for (let first = 1; first <= pages; first += pagesPerSignature) {
    const real = Math.min(pages - first + 1, pagesPerSignature)
    const padded = Math.ceil(real / 4) * 4
    const last = first + padded - 1
    blankPages += padded - real
    const page = number => number > pages ? null : number
    layout.push(Array.from({length:padded / 4}, (_, sheet) => ({
      front:[page(last - 2 * sheet),page(first + 2 * sheet)],
      back:[page(first + 2 * sheet + 1),page(last - 2 * sheet - 1)],
    })))
  }
  return {signatures:layout.length,blankPages,layout}
}

try {
  if (process.argv.length !== 3) throw new Error('Usage: node app.mjs input.json')
  console.log(JSON.stringify(analyze(JSON.parse(readFileSync(process.argv[2], 'utf8')))))
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
