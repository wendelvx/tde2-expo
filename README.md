# 🛡️ Dungeon Master - TDE 2 (Mobile)

Protótipo funcional desenvolvido em **React Native (Expo)** para a disciplina de Projeto Integrador do curso de ADS e SI do **Centro Universitário Paraíso (UNIFAP)**.

O **Dungeon Master** é uma plataforma gamificada de treinamento técnico e simulação de ambientes críticos. O aplicativo permite que os usuários participem de batalhas colaborativas massivas, onde problemas reais de infraestrutura e desenvolvimento são transpostos para mecânicas de RPG.

## 👥 Integrantes da Equipe
| Nome | Matrícula |
| :--- | :--- |
| **Rafaele Ferreira Pinto** | 20241130047 |
| **Paulo Wendel Alves Peixoto** | 20241130052 |
| **Douglas Rocha** | 2022113055 |
| **Richard Ferreira Oliveira Cunha** | 20232180027 |
| **Nilza Kelly Campos Fernandes** | 20241180157 |
| **Vinicius Sarmento Ramos** | 20241180174 |
| **Mateus José Rosado Ferreira** | 20241130072 |
| **Isaac Oliveira Menezes** | 20241180182 |
| **Vanessa Carine Alves Silva** | 20241130071 |

## ⚙️ Arquitetura e Simulação (Dados Mockados)
Este projeto foi originalmente arquitetado para operar com WebSockets e eventos em tempo real. Para a entrega da **TDE 2**, a aplicação foi refatorada para utilizar **Dados Mockados** (`src/constants/gameMocks.ts`), garantindo a demonstração completa da experiência do usuário sem dependência de infraestrutura externa.

### 🎮 Mecânicas Implementadas na Simulação:
- **Squad HP & Condição de Derrota:** A equipe possui uma barra de integridade (2000 HP). Se o Boss causar dano crítico e a vida chegar a zero, o Squad é derrotado.
- **Bloqueio Operacional:** Durante incidentes ativos, o dano automático do Squad é interrompido, simulando o travamento da equipe frente a bugs críticos.
- **Resolução de Squad:** Incidentes de outras classes são resolvidos automaticamente após 5 segundos, permitindo visualizar a progressão do time.
- **Chefes Reais:** Os Bosses utilizam fotos reais do corpo docente da UNIFAP, transformando a experiência acadêmica em um desafio de RPG.

## 🚀 Como Executar o Projeto

1. **Instalar dependências:**
   ```bash
   npm install
Iniciar o servidor Expo:

Bash
npx expo start
Visualizar:
Escaneie o QR Code exibido no terminal utilizando o aplicativo Expo Go (disponível para Android e iOS).

🛠️ Tecnologias Utilizadas
React Native (Expo Router)

Context API (Engine de jogo e gerenciamento de estado)

Expo Haptics (Feedback físico por vibração)

TypeScript (Segurança e tipagem do sistema)

Repositório: https://github.com/wendelvx/tde2-expo