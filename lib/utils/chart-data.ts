import type { Guest, PartyWithGuestCount } from "../types"

// Função para gerar dados de confirmações por dia
export function generateConfirmationsByDayData(guests: Guest[]) {
  // Agrupar confirmações por data
  const confirmationsByDay = guests.reduce((acc: Record<string, number>, guest) => {
    const date = new Date(guest.data_envio_formulario).toLocaleDateString("pt-BR")
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Ordenar datas
  const sortedDates = Object.keys(confirmationsByDay).sort(
    (a, b) =>
      new Date(a.split("/").reverse().join("-")).getTime() - new Date(b.split("/").reverse().join("-")).getTime(),
  )

  // Limitar a 7 dias para melhor visualização
  const limitedDates = sortedDates.slice(-7)
  const limitedCounts = limitedDates.map((date) => confirmationsByDay[date])

  return {
    labels: limitedDates,
    datasets: [
      {
        label: "Confirmações",
        data: limitedCounts,
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        borderColor: "rgb(124, 58, 237)",
        borderWidth: 1,
      },
    ],
  }
}

// Função para gerar dados de status de confirmação
export function generateConfirmationStatusData(guests: Guest[]) {
  // Contar confirmações
  const confirmed = guests.filter((guest) => guest.status_confirmacao_final).length
  const pending = guests.length - confirmed

  return {
    labels: ["Confirmados", "Pendentes"],
    datasets: [
      {
        data: [confirmed, pending],
        backgroundColor: ["rgba(34, 197, 94, 0.5)", "rgba(234, 179, 8, 0.5)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(234, 179, 8)"],
        borderWidth: 1,
      },
    ],
  }
}

// Função para gerar dados de distribuição de convidados
export function generateGuestDistributionData(guests: Guest[]) {
  // Contar adultos e crianças
  const totalAdults = guests.reduce((acc, guest) => acc + (guest.quantidade_total - guest.quantidade_criancas), 0)
  const totalChildren = guests.reduce((acc, guest) => acc + guest.quantidade_criancas, 0)

  return {
    labels: ["Adultos", "Crianças"],
    datasets: [
      {
        data: [totalAdults, totalChildren],
        backgroundColor: ["rgba(124, 58, 237, 0.5)", "rgba(249, 115, 22, 0.5)"],
        borderColor: ["rgb(124, 58, 237)", "rgb(249, 115, 22)"],
        borderWidth: 1,
      },
    ],
  }
}

// Função para gerar dados de festas por mês
export function generatePartiesByMonthData(parties: PartyWithGuestCount[]) {
  // Agrupar festas por mês
  const partiesByMonth = parties.reduce((acc: Record<string, number>, party) => {
    const month = new Date(party.data).toLocaleDateString("pt-BR", { month: "long" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  // Ordenar meses
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ]
  const sortedMonths = Object.keys(partiesByMonth).sort(
    (a, b) => months.indexOf(a.toLowerCase()) - months.indexOf(b.toLowerCase()),
  )

  return {
    labels: sortedMonths,
    datasets: [
      {
        label: "Festas",
        data: sortedMonths.map((month) => partiesByMonth[month]),
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        borderColor: "rgb(124, 58, 237)",
        borderWidth: 1,
      },
    ],
  }
}

// Função para calcular estatísticas gerais
export function calculateStatistics(guests: Guest[], parties: PartyWithGuestCount[]) {
  const totalGuests = guests.length
  const confirmedGuests = guests.filter((guest) => guest.status_confirmacao_final).length
  const confirmationRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0
  const totalParties = parties.length
  const averageGuestsPerParty = totalParties > 0 ? Math.round(totalGuests / totalParties) : 0
  const totalAttendees = guests.reduce((acc, guest) => {
    return guest.status_confirmacao_final ? acc + guest.quantidade_total : acc
  }, 0)

  return {
    totalGuests,
    confirmedGuests,
    confirmationRate,
    totalParties,
    averageGuestsPerParty,
    totalAttendees,
  }
}
