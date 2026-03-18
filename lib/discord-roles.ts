// Função para verificar se um usuário tem um cargo específico no Discord
export async function checkUserRole(userId: string, roleId: string, guildId: string): Promise<boolean> {
  try {
    // Esta função precisa ser implementada no backend por segurança
    // Por enquanto, retorna false para todos exceto admin
    const ADMIN_USER_ID = '1329449358709755946';
    
    if (userId === ADMIN_USER_ID) {
      return true; // Admin sempre tem acesso
    }
    
    // TODO: Implementar verificação real via API do Discord
    // 1. Usar o token de acesso do usuário
    // 2. Fazer request para a API do Discord
    // 3. Verificar se o usuário tem o cargo específico
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar cargo do usuário:', error);
    return false;
  }
}

// Função para obter os cargos de um usuário em um servidor
export async function getUserRoles(userId: string, guildId: string): Promise<string[]> {
  try {
    // TODO: Implementar verificação real via API do Discord
    // Por enquanto, retorna array vazio
    return [];
  } catch (error) {
    console.error('Erro ao obter cargos do usuário:', error);
    return [];
  }
}
