# Como Jogar CodeQuest em Rede Local

Este guia explica como permitir que amigos na mesma rede WiFi/LAN joguem contigo.

## Pré-requisitos

- Tu e o teu amigo devem estar na **mesma rede WiFi ou LAN**
- Teu IP local atual: **10.2.3.140**
- Servidor backend na porta: **3000**
- Frontend Vite na porta: **5173** (padrão)

## Passos para Configurar

### 1. Configurar o Firewall do Windows

Precisas permitir conexões na porta 3000. Abre **PowerShell como Administrador** e executa:

```powershell
New-NetFirewallRule -DisplayName "CodeQuest Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Opcionalmente, também podes permitir acesso ao frontend (porta 5173):

```powershell
New-NetFirewallRule -DisplayName "CodeQuest Frontend (Vite)" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### 2. Iniciar o Servidor Backend

No teu computador, abre um terminal e executa:

```bash
cd c:\Users\2223216\code-quest\backend
npm run dev
```

Deves ver algo como:
```
🎮 Bananapoly backend listening at http://localhost:3000
🌐 Network access: http://10.2.3.140:3000
📱 Para jogar em rede, o amigo deve conectar ao IP acima
```

### 3. Iniciar o Frontend

No teu computador, abre outro terminal e executa:

```bash
cd c:\Users\2223216\code-quest\frontend
npm run dev
```

O Vite vai iniciar, geralmente em `http://localhost:5173`.

### 4. Como o Teu Amigo Pode Jogar

O amigo tem **duas opções**:

#### Opção A: Acessar direto pelo IP (mais fácil)

1. O amigo abre o browser dele
2. Acessa: `http://10.2.3.140:5173`
3. Entra no código da sala que criaste

> **Nota:** O Vite por padrão já aceita conexões remotas quando roda em modo dev, então isto deve funcionar.

#### Opção B: Clonar o repositório (mais estável)

1. O amigo clona o repositório
2. Cria o arquivo `.env` no frontend com:
   ```
   VITE_API_URL=http://10.2.3.140:3000
   ```
3. Instala dependências: `npm install` (no frontend)
4. Executa: `npm run dev`
5. Abre `http://localhost:5173` no browser **dele**
6. Entra no código da sala

## Testar a Conexão

### No Teu PC:
1. Abre `http://localhost:5173`
2. Clica em "Criar Sala"
3. Anota o código da sala (ex: ABC123)

### No PC do Amigo:
1. Abre o frontend (usando uma das opções acima)
2. Clica em "Entrar em Sala"
3. Digita o código da sala
4. Deve aparecer na lobby!

## Se Não Funcionar

### Verificar Firewall
- Certifica-te que executaste o comando do firewall
- Verifica em `Firewall do Windows > Regras de Entrada` se "CodeQuest Backend" está ativa

### Verificar IP
Se o IP mudou (DHCP), verifica o IP atual com:
```powershell
ipconfig
```
Procura pelo IPv4 Address na interface principal (Ethernet).

### Testar Conectividade
O amigo pode testar se consegue alcançar o servidor:
```bash
# No browser do amigo
http://10.2.3.140:3000
```
Deve aparecer algo como `{"message":"Use Socket.IO for multiplayer"}`.

## Jogar Pela Internet (Avançado)

Se o amigo **não estiver na mesma rede**, precisarás de:
- **Port Forwarding** no router (complexo, depende do router)
- Ou usar um serviço como **ngrok** para criar um túnel temporário

Avisa se quiseres ajuda com isso!

## Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Sala não encontrada" | Verifica se o backend está rodando e se o IP está correto no `.env` |
| Conexão recusada | Verifica firewall, IP correto, e se estão na mesma rede |
| IP mudou | Atualiza `.env` com novo IP e reinicia frontend |

---

**Boa sorte e bom jogo! 🎮🎲**
