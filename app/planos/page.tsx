import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Star, ArrowLeft } from "lucide-react"

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para a página inicial
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-purple-800 mb-6">Planos e Preços</h1>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para o seu salão de festas e comece a gerenciar confirmações de presença de forma
              eficiente e profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Plano 3 meses */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Plano Trimestral</h3>
                <p className="opacity-90">Ideal para testar o sistema</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-blue-600">R$ 297</span>
                  <span className="text-gray-500 ml-2">/ 3 meses</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 10 festas por mês</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Confirmações ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Formulários personalizáveis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios básicos</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Assinar Agora</Button>
              </div>
            </div>

            {/* Plano 6 meses */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Plano Semestral</h3>
                <p className="opacity-90">Nossa opção mais popular</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-purple-600">R$ 497</span>
                  <span className="text-gray-500 ml-2">/ 6 meses</span>
                  <div className="text-sm text-purple-600 font-medium mt-1">Economia de R$ 97</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 20 festas por mês</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Confirmações ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalização de formulários</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Exportação de dados</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Assinar Agora</Button>
              </div>
            </div>

            {/* Plano 1 ano */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 relative">
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                MELHOR VALOR
              </div>
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Plano Anual</h3>
                <p className="opacity-90">Máximo de benefícios</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-pink-600">R$ 897</span>
                  <span className="text-gray-500 ml-2">/ ano</span>
                  <div className="bg-yellow-100 text-yellow-800 font-medium rounded-full px-3 py-1 text-sm mt-2">
                    3 meses GRÁTIS incluídos!
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Festas ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Confirmações ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte VIP 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalização completa</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Exportação de dados</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">Integração com WhatsApp</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">Área exclusiva para pais</span>
                  </li>
                </ul>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">Assinar Agora</Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">Perguntas Frequentes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-purple-700 mb-2">Como funciona a cobrança?</h3>
                <p className="text-gray-600">
                  A cobrança é feita de forma única no momento da assinatura. Você pode escolher entre os planos de 3
                  meses, 6 meses ou anual.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-purple-700 mb-2">Posso mudar de plano depois?</h3>
                <p className="text-gray-600">
                  Sim, você pode fazer upgrade do seu plano a qualquer momento. O valor proporcional do plano atual será
                  descontado do novo plano.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-purple-700 mb-2">
                  O que acontece após o período da assinatura?
                </h3>
                <p className="text-gray-600">
                  Ao final do período, você pode renovar sua assinatura ou ela será automaticamente cancelada. Não
                  fazemos renovações automáticas.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-purple-700 mb-2">Como funciona o suporte?</h3>
                <p className="text-gray-600">
                  Oferecemos suporte por email para todos os planos. Os planos Semestral e Anual contam com suporte
                  prioritário, e o plano Anual inclui suporte VIP 24/7.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">Ainda tem dúvidas?</h2>
            <p className="text-gray-600 mb-8">
              Entre em contato com nossa equipe de vendas para obter mais informações ou solicitar uma demonstração
              personalizada.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg">Falar com um Consultor</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
