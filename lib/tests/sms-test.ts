import { sendSMS, getSMSHistory } from "@/lib/services/sms-service"

export async function testSMSConfiguration() {
  const results = {
    configured: false,
    variables: {
      accountSid: false,
      authToken: false,
      phoneNumber: false,
    },
    message: "",
  }

  // Check environment variables
  results.variables.accountSid = !!process.env.TWILIO_ACCOUNT_SID
  results.variables.authToken = !!process.env.TWILIO_AUTH_TOKEN
  results.variables.phoneNumber = !!process.env.TWILIO_PHONE_NUMBER

  results.configured = results.variables.accountSid && results.variables.authToken && results.variables.phoneNumber

  if (results.configured) {
    results.message = "Twilio configurado corretamente"
  } else {
    const missing = []
    if (!results.variables.accountSid) missing.push("TWILIO_ACCOUNT_SID")
    if (!results.variables.authToken) missing.push("TWILIO_AUTH_TOKEN")
    if (!results.variables.phoneNumber) missing.push("TWILIO_PHONE_NUMBER")
    results.message = `Variáveis faltando: ${missing.join(", ")}`
  }

  return results
}

export async function testSMSSend(phoneNumber: string) {
  try {
    const result = await sendSMS({
      to: phoneNumber,
      message: "Teste de SMS do sistema de confirmação de festas",
    })

    return {
      success: result.success,
      message: result.success ? "SMS enviado com sucesso" : result.error,
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
      details: error,
    }
  }
}

export async function testSMSHistory() {
  try {
    const result = await getSMSHistory()

    return {
      success: result.success,
      message: result.success ? `${result.data?.length || 0} mensagens no histórico` : result.error,
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
      details: error,
    }
  }
}

export async function runAllSMSTests(phoneNumber?: string) {
  const results = {
    configuration: await testSMSConfiguration(),
    send: phoneNumber ? await testSMSSend(phoneNumber) : null,
    history: await testSMSHistory(),
  }

  const allPassed = results.configuration.configured && 
    (!results.send || results.send.success) && 
    results.history.success

  return {
    success: allPassed,
    results,
    message: allPassed ? "Todos os testes de SMS passaram" : "Alguns testes falharam",
  }
}
