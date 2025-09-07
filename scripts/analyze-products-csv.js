const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/products_rows%20%281%29-JXoeOCjl8YpNqdDuTMAVntLeVYmiRH.csv"

async function analyzeProductsData() {
  try {
    console.log("[v0] Fetching products CSV data...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("[v0] CSV Content:")
    console.log(csvText)

    // Parse CSV manually
    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    console.log("[v0] Headers:", headers)

    const products = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",")
        const product = {}
        headers.forEach((header, index) => {
          product[header.trim()] = values[index]?.trim() || ""
        })
        products.push(product)
      }
    }

    console.log("[v0] Total products found:", products.length)

    // Show product names for comparison
    console.log("[v0] Product names in database:")
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}"`)
    })

    // Look for controller products specifically
    const controllers = products.filter((p) => p.name?.toLowerCase().includes("controller"))
    console.log("[v0] Controller products found:")
    controllers.forEach((controller) => {
      console.log(`- "${controller.name}"`)
    })

    return products
  } catch (error) {
    console.error("[v0] Error fetching CSV:", error)
  }
}

analyzeProductsData()
