"use client"
import { signIn, useSession } from "@/lib/auth-client"
import { DiscordLogin } from "@/components/auth/DiscordLogin"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"

export function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Bem-vindo ao<br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Logs França City
              </span>
            </h1>
          </>
        }
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4 overflow-hidden flex items-center justify-center">
          <div className="max-w-sm w-full">
            <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700">
              {/* Logo/Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
                <p className="text-gray-400">Faça login para continuar</p>
              </div>

              {/* Login Form */}
              <div className="space-y-6">
                <div className="text-center flex flex-col items-center">
                  <p className="text-gray-300 mb-4">Entre com sua conta Discord</p>
                  <div className="flex justify-center">
                    <DiscordLogin />
                  </div>
                </div>

                {/* Features */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-white font-semibold mb-3 text-sm text-center">Após o login, você terá:</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Dashboard em tempo real
                    </li>
                    <li className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Análises e estatísticas
                    </li>
                    <li className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Atividades recentes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-500 text-xs">
                  Desenvolvido por zn • Powered by França City
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  )
}
