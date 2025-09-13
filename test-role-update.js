// Script de prueba para verificar el endpoint de actualización de rol
const testRoleUpdate = async () => {
  try {
    console.log("Probando endpoint de actualización de rol...")
    
    const response = await fetch("http://localhost:3000/api/users/895797694583431178/update-role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": "next-auth.session-token=your-session-token-here" // Necesitarás el token real
      },
      body: JSON.stringify({ role: "ADMIN" })
    })
    
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

// testRoleUpdate() 