# Script para configurar o Firewall do Windows para CodeQuest
# IMPORTANTE: Executar PowerShell como Administrador!

Write-Host "🔧 Configurando Firewall do Windows para CodeQuest..." -ForegroundColor Cyan
Write-Host ""

# Permitir Backend (porta 3000)
try {
    New-NetFirewallRule -DisplayName "CodeQuest Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✅ Regra criada: CodeQuest Backend (porta 3000)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "ℹ️  Regra 'CodeQuest Backend' já existe" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao criar regra para Backend: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Permitir Frontend Vite (porta 5173)
try {
    New-NetFirewallRule -DisplayName "CodeQuest Frontend (Vite)" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✅ Regra criada: CodeQuest Frontend (porta 5173)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "ℹ️  Regra 'CodeQuest Frontend (Vite)' já existe" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao criar regra para Frontend: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📌 Podes verificar as regras em: Firewall do Windows > Regras de Entrada" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Inicia o backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Inicia o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  3. O amigo acessa: http://10.2.3.140:5173" -ForegroundColor White
Write-Host ""
