// Script de prueba para el endpoint de actualización de rol
const testEndpoint = async () => {
  try {
    console.log("Probando endpoint...")
    
    const response = await fetch("http://localhost:3000/api/users/895797694583431178/update-role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "ADMIN" })
    })
    
    console.log("Status:", response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log("✅ Éxito:", data)
    } else {
      const error = await response.json()
      console.log("❌ Error:", error)
    }
  } catch (error) {
    console.error("❌ Error de red:", error)
  }
}

// testEndpoint() 