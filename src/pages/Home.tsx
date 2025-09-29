import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, CheckCircle, Check, Star, PartyPopper } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Bem-vindo ao Check Party</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Organize suas festas com facilidade e gerencie confirmações de presença em um só lugar
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-3">🎉 Promoção de Lançamento!</h2>
              <p className="text-lg mb-4">Cadastre-se até 30/06 e aproveite nossos planos promocionais.</p>
              <Link to="/planos">
                <Button className="bg-white text-purple-700 hover:bg-gray-100">
                  Saiba mais <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-purple-800 mb-6">
              Sistema de Confirmação de Presença para Festas
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Gerencie confirmações de presença para festas de forma simples e eficiente. Envie convites, receba
              confirmações e mantenha o controle da sua lista de convidados.
            </p>
          </div>

          {/* Planos */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">Planos Especiais de Lançamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano Trimestral */}
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
                  </ul>
                  <Link to="/checkout/trimestral">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Assinar Agora</Button>
                  </Link>
                </div>
              </div>

              {/* Plano Semestral */}
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
                  </ul>
                  <Link to="/checkout/semestral">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Assinar Agora</Button>
                  </Link>
                </div>
              </div>

              {/* Plano Anual */}
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
                      <Star className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Integração com WhatsApp</span>
                    </li>
                  </ul>
                  <Link to="/checkout/anual">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">Assinar Agora</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Acesso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">Acesso ao Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-purple-700 mb-4">Salões de Festa</h2>
                <p className="text-gray-600 mb-6">
                  Área para salões cadastrados gerenciarem festas, convidados e confirmações de presença.
                </p>
                <Link to="/admin/login">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Área do Salão</Button>
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-pink-600 mb-4">Pais e Responsáveis</h2>
                <p className="text-gray-600 mb-6">
                  Acesso exclusivo para pais aprovarem convidados e gerenciarem a lista de presença da festa.
                </p>
                <Link to="/pais/login">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">Área dos Pais</Button>
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Convidados</h2>
                <p className="text-gray-600 mb-6">
                  Área para convidados confirmarem presença em festas através do nome do aniversariante.
                </p>
                <Link to="/convidado">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">Confirmar Presença</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Como Funciona */}
          <div id="como-funciona" className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">Como Funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                  1
                </div>
                <h3 className="font-medium text-lg mb-2">Cadastro do Salão</h3>
                <p className="text-gray-600 text-center">
                  O salão de festas se cadastra em um dos planos e começa a criar eventos.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                  2
                </div>
                <h3 className="font-medium text-lg mb-2">Gestão de Festas</h3>
                <p className="text-gray-600 text-center">
                  O salão cria festas e fornece credenciais de acesso aos pais dos aniversariantes.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                  3
                </div>
                <h3 className="font-medium text-lg mb-2">Confirmações</h3>
                <p className="text-gray-600 text-center">
                  Convidados confirmam presença e os pais aprovam a lista final de convidados.
                </p>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div id="recursos" className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-purple-800 mb-6">Recursos do Check Party</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="font-medium text-lg mb-2">Gerenciamento de Eventos</h3>
                <p className="text-gray-600">Crie e gerencie múltiplas festas com temas personalizados.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="font-medium text-lg mb-2">Lista de Convidados</h3>
                <p className="text-gray-600">Controle quem confirmou presença e gerencie acompanhantes.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="font-medium text-lg mb-2">Confirmação em Etapas</h3>
                <p className="text-gray-600">Processo seguro com aprovação dos pais para confirmação final.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Cadastre seu salão de festas hoje mesmo e aproveite nossa promoção de lançamento com 3 meses grátis no
            plano anual!
          </p>
          <Link to="/admin/register">
            <Button className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8 py-6">
              Cadastrar Meu Salão
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer id="contato" className="bg-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <PartyPopper className="h-5 w-5 mr-2" /> Check Party
              </h3>
              <p className="text-purple-200">
                Sistema completo para gerenciamento de confirmações de presença em festas.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <p className="text-purple-200 mb-2">contato@checkparty.com.br</p>
              <p className="text-purple-200">(11) 99999-9999</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="#" className="text-purple-200 hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-purple-200 hover:text-white">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-purple-200 hover:text-white">
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800 mt-8 pt-8 text-center text-purple-300">
            <p>&copy; {new Date().getFullYear()} Check Party. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
