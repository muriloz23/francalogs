"use client";
import { useState } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DiscordLogin } from "@/components/auth/DiscordLogin";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminPage() {
  const { data: session } = useSession();
  const [botToken, setBotToken] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState("");

  const startBot = async () => {
    if (!botToken.trim()) {
      setMessage("Por favor, insira o token do bot");
      return;
    }

    setIsStarting(true);
    setMessage("");

    try {
      const response = await fetch("/api/bot/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: botToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Bot iniciado com sucesso! ID: ${data.botId}`);
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao conectar com o servidor");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Painel Admin<br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Bot Discord
              </span>
            </h1>
          </>
        }
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 p-6 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Administração</h2>
                <p className="text-gray-400 text-sm">Gerenciar Bot Discord</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
              <Link 
                href="/"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors duration-200"
              >
                ← Voltar
              </Link>
              <DiscordLogin />
            </div>
          </div>

          {/* Bot Configuration */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-white font-semibold mb-4 text-lg">Configurar Bot Discord</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Token do Bot Discord
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Cole o token do seu bot aqui"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={startBot}
                disabled={isStarting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? "Iniciando..." : "Iniciar Bot"}
              </button>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes("✅") ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
                }`}>
                  {message}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-white font-medium mb-2">Instruções:</h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Crie um bot no Discord Developer Portal</li>
                <li>Ative os intents: GUILD_MESSAGES, MESSAGE_CONTENT</li>
                <li>Convide o bot para o servidor (Guild: 1443298554398511227)</li>
                <li>Cole o token do bot no campo acima</li>
                <li>Clique em "Iniciar Bot"</li>
              </ol>
              <p className="text-gray-400 text-xs mt-2">
                O bot irá coletar mensagens da categoria ID: 1466188857241243863
              </p>
            </div>

            {/* Link para Dashboard */}
            <div className="mt-4 text-center">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ver Dashboard de Logs
              </Link>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
