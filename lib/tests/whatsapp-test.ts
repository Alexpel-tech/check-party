export interface WhatsAppTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export async function testWhatsAppConfiguration(): Promise<WhatsAppTestResult> {
  try {
    const requiredVars = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return {
        success: false,
        message: "Variáveis de ambiente do WhatsApp não configuradas",
        details: { missingVars },
      }
    }

    return {
      success: true,
      message: "Configuração do WhatsApp válida",
      details: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        tokenConfigured: !!process.env.WHATSAPP_ACCESS_TOKEN,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao verificar configuração WhatsApp",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testWhatsAppSending(phoneNumber: string): Promise<WhatsAppTestResult> {
  try {
    const response = await fetch("/api/test/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: "Teste de WhatsApp - Sistema de Confirmação de Festa",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: "Falha no envio de WhatsApp",
        error: result.error || "Erro desconhecido",
      }
    }

    return {
      success: true,
      message: "WhatsApp enviado com sucesso",
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar envio de WhatsApp",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function runAllWhatsAppTests(phoneNumber?: string): Promise<WhatsAppTestResult[]> {
  const results = []

  // Teste de configuração
  results.push(await testWhatsAppConfiguration())

  // Teste de envio (apenas se número fornecido)
  if (phoneNumber) {
    results.push(await testWhatsAppSending(phoneNumber))
  }

  return results
}
