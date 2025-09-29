export interface SMSTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export async function testSMSConfiguration(): Promise<SMSTestResult> {
  try {
    const requiredVars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return {
        success: false,
        message: "Variáveis de ambiente do Twilio não configuradas",
        details: { missingVars },
      }
    }

    return {
      success: true,
      message: "Configuração do Twilio válida",
      details: {
        accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + "...",
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao verificar configuração SMS",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testSMSSending(phoneNumber: string): Promise<SMSTestResult> {
  try {
    const response = await fetch("/api/test/sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: "Teste de SMS - Sistema de Confirmação de Festa",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: "Falha no envio de SMS",
        error: result.error || "Erro desconhecido",
      }
    }

    return {
      success: true,
      message: "SMS enviado com sucesso",
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar envio de SMS",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function runAllSMSTests(phoneNumber?: string): Promise<SMSTestResult[]> {
  const results = []

  // Teste de configuração
  results.push(await testSMSConfiguration())

  // Teste de envio (apenas se número fornecido)
  if (phoneNumber) {
    results.push(await testSMSSending(phoneNumber))
  }

  return results
}
