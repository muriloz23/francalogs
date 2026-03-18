import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, roleId, guildId } = await request.json();

    if (!userId || !roleId || !guildId) {
      return NextResponse.json(
        { error: 'Parâmetros userId, roleId e guildId são obrigatórios' },
        { status: 400 }
      );
    }

    // IDs específicos fornecidos pelo usuário
    const REQUIRED_ROLE_ID = '1443295095632695354';
    const REQUIRED_GUILD_ID = '1443295095112863758';

    // Verifica se os parâmetros correspondem aos IDs requeridos
    if (roleId !== REQUIRED_ROLE_ID || guildId !== REQUIRED_GUILD_ID) {
      return NextResponse.json(
        { error: 'Cargo ou servidor não autorizado' },
        { status: 403 }
      );
    }

    // Lista de usuários permitidos (temporário - substituir por verificação real)
    const ALLOWED_USER_IDS = [
      '1329449358709755946', // Admin
      // Adicione outros IDs permitidos aqui
    ];

    // Verificação temporária - substituir por API do Discord
    const hasRole = ALLOWED_USER_IDS.includes(userId);

    // TODO: Implementar verificação real via API do Discord
    // 1. Obter token de acesso do usuário (precisa ser passado no request)
    // 2. Fazer request para: https://discord.com/api/v10/guilds/{guildId}/members/{userId}
    // 3. Verificar se o roleId está no array de roles do membro

    return NextResponse.json({ hasRole });
  } catch (error) {
    console.error('Erro ao verificar cargo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
