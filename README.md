# Foco

**Um botão só. Liga o foco e os vídeos curtos somem.**

Eu percebi que Shorts, Reels e TikTok estavam comendo meu dia sem eu perceber: abria o YouTube pra ver uma aula e, 40 minutos depois, estava no 80º short. As extensões que eu usava resolviam parte disso, mas cada uma cobria uma plataforma e todas tinham uma tela cheia de opções. Então fiz a minha: sem configuração nenhuma, só um botão de **Ligar foco**.

## O que ela bloqueia

| Plataforma | Com o foco ligado |
|---|---|
| **YouTube** | Shorts somem de tudo: início, inscrições, busca, recomendações, menu lateral, aba do canal e filtro da busca. Abrir um link `/shorts/` mostra a tela de bloqueio. O resto do YouTube funciona normal. |
| **Instagram** | Nenhum vídeo toca: nem Reels, nem vídeo do feed, nem stories em vídeo, nem vídeo **mandado por amigo nas mensagens**. O link Reels some do menu e dos perfis, e `/reels` ou `/reel/...` mostram a tela de bloqueio. Fotos, mensagens e o resto continuam funcionando. |
| **TikTok** | O site inteiro fica bloqueado. |
| **Facebook** | Reels somem do feed e as páginas `/reel` e `/reels` ficam bloqueadas. |

## Instalar (Chrome, Edge, Brave, Opera)

1. Baixe o projeto: **Code → Download ZIP** e extraia, ou `git clone`.
2. Abra `chrome://extensions` (no Edge, `edge://extensions`).
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e escolha a pasta `foco`.
5. Fixe o ícone na barra e pronto: o foco já vem ligado.

## Como funciona

- **Manifest V3**, sem nenhuma biblioteca, sem servidor e sem coletar dado nenhum. A única permissão é `storage`, para lembrar se o foco está ligado.
- **CSS** esconde os blocos de Shorts e Reels. Todas as regras dependem da classe `foco-on` no `<html>`, então desligar o foco devolve tudo na hora, sem recarregar a página.
- **Content script** cuida do que CSS não resolve:
  - YouTube e Instagram trocam de página sem recarregar, então o script vigia a URL e abre a tela de bloqueio quando você cai num Short ou Reel.
  - Escuta o evento `play` na fase de captura e pausa (e muta) o vídeo antes do site conseguir tocar. É isso que impede vídeo no direct do Instagram, mesmo com os nomes de classe embaralhados que o Instagram usa.
  - A tela de bloqueio fica num Shadow DOM, pra o CSS do site não quebrar o visual.

```
foco/
├── manifest.json
├── background.js       # estado inicial e selo "OFF" no ícone
├── content/
│   ├── content.js      # tela de bloqueio, pausa de vídeos, vigia de URL
│   └── block.css       # o que some de cada site
├── popup/              # o botão de ligar foco
└── icons/
```

## Adicionar outra plataforma

Em `content/content.js`, coloque um item novo na lista `SITES` (nome, domínio, quais páginas bloquear e se bloqueia todo vídeo), adicione o domínio em `manifest.json` e, se precisar esconder alguma coisa, as regras em `content/block.css` com o prefixo `html.foco-on.foco-<id>`.

## Licença

MIT
