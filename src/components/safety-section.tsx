import { CheckCircle, ShieldCheck } from "lucide-react";

export function SafetySection() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Segurança e Confiabilidade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Perfis Verificados
            </h3>
            <p className="text-gray-600 mb-4">
              Todos os usuários passam por um processo de verificação de
              identidade para garantir a segurança das transações.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Sistema de Avaliação
            </h3>
            <p className="text-gray-600 mb-4">
              Avalie e seja avaliado após cada transação. A pontuação de 1 a 5
              estrelas ajuda a manter a comunidade confiável.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Contrato Digital
            </h3>
            <p className="text-gray-600">
              Todo acordo fechado na plataforma gera um contrato digital com os
              termos combinados, protegendo ambas as partes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <ShieldCheck className="text-3xl text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">
                Dicas de Segurança
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>Nunca compartilhe dados pessoais sensíveis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Combine encontros em locais públicos quando necessário
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Use o sistema de mensagens da plataforma para comunicação
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>Desconfie de propostas muito abaixo do mercado</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Verifique as avaliações do usuário antes de fechar negócio
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
