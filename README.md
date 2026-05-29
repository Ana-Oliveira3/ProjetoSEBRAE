# MindUp

Plataforma de apoio emocional para jovens com foco em prevenção, acolhimento e organização emocional.

Slogan: "Cuidar da mente também faz parte do futuro."

## O que o site entrega

- Login/cadastro com contas salvas em Storage local do servidor.
- Check-in emocional salvo dentro da conta do usuário.
- Exercícios rápidos de respiração, foco e relaxamento.
- Gráfico simples de humor e estresse.
- Sugestões personalizadas de autocuidado.
- Ranking pessoal de hábitos saudáveis.
- Espaço anônimo com moderação básica.
- Modo emergência emocional com CVV 188 e SAMU 192.
- Seção de pitch com problema, solução, público-alvo, objetivos e impacto social.
- Área de privacidade com exportação e exclusão dos dados da conta.
- PWA instalável no celular como aplicativo.

## Como rodar

```bash
npm install
npm run dev
```

No modo de desenvolvimento, as contas ficam salvas em `data/users.json` e também são copiadas para o `localStorage` do navegador.

Para rodar como app com Storage do servidor depois do build:

```bash
npm run app
```

Para acessar de outro celular ou computador, abra no outro dispositivo o endereço de rede mostrado pelo terminal, usando o mesmo Wi-Fi ou rede.

## Verificação

```bash
npm run lint
npm run build
```

## Observação responsável

O MindUp é uma proposta preventiva. Ele não substitui psicólogo, médico, atendimento profissional ou serviço de emergência.
