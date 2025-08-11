// Fetch database schema from the provided CSV files
async function fetchSchemaData() {
  try {
    console.log("Fetching first schema file...")
    const response1 = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Supabase%20Snippet%20Database%20Schema%20Explorer-ze5TbZIyF0fcpu0O6eIW3GWcyG5wOy.csv",
    )
    const data1 = await response1.text()
    console.log("First file content:")
    console.log(data1)

    console.log("\n\nFetching second schema file...")
    const response2 = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Supabase%20Snippet%20Database%20Schema%20Explorer%20%281%29-5k796bI2r9WJ8x4DJ2YlmRGKwFgB35.csv",
    )
    const data2 = await response2.text()
    console.log("Second file content:")
    console.log(data2)

    // Parse CSV data to understand table structures
    const parseCSV = (csvText) => {
      const lines = csvText.trim().split("\n")
      const headers = lines[0].split(",")
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",")
        const obj = {}
        headers.forEach((header, index) => {
          obj[header.replace(/"/g, "")] = values[index]?.replace(/"/g, "") || ""
        })
        return obj
      })
      return rows
    }

    console.log("\n\nParsed data from first file:")
    const parsed1 = parseCSV(data1)
    console.log(JSON.stringify(parsed1, null, 2))

    console.log("\n\nParsed data from second file:")
    const parsed2 = parseCSV(data2)
    console.log(JSON.stringify(parsed2, null, 2))
  } catch (error) {
    console.error("Error fetching schema data:", error)
  }
}

fetchSchemaData()
