# Player Models Directory

Este diretório contém os modelos 3D (.glb) dos jogadores.

## Estrutura de Ficheiros

Coloque os seus modelos .glb aqui seguindo a convenção de nomes:

- `red_player.glb` - Modelo para o jogador vermelho (#ff0000)
- `blue_player.glb` - Modelo para o jogador azul (#0000ff)
- `green_player.glb` - Modelo para o jogador verde (opcional)
- `yellow_player.glb` - Modelo para o jogador amarelo (opcional)

## Configuração

Para adicionar novos modelos ou alterar os modelos existentes:

1. Coloque o ficheiro .glb neste diretório
2. Edite `src/config/modelConfig.ts` para mapear a cor do jogador ao caminho do modelo
3. Ajuste a escala (`scale`) se necessário

## Exemplo

```typescript
{
    color: '#ff0000', // Vermelho
    modelPath: '/models/red_player.glb',
    scale: 1.0 // Ajuste conforme necessário
}
```

## Fallback

Se um modelo não for encontrado ou falhar ao carregar, o jogo automaticamente usará um cubo colorido como fallback.
