# Sorrisus (Front-end)

Este repositório contém a interface web do Sorrisus — um sistema para gestão de clínicas odontológicas: pacientes, agenda, consultas, ficha clínica, serviços e retornos pendentes.

A API fica no repositório `Sorrisus_BackEnd`.

## Perfis de acesso

O menu e as ações disponíveis mudam conforme o perfil do usuário logado:

| Perfil | O que pode fazer |
| :--- | :--- |
| **Dentista** | Agenda própria; gerenciar pacientes, agendamentos e serviços; preencher a ficha clínica e finalizar atendimentos; registrar não comparecimento e cancelar consultas; ver retornos pendentes. |
| **Recepcionista** | Agenda da clínica (escolhendo o dentista); gerenciar pacientes, agendamentos e serviços; registrar não comparecimento e cancelar consultas; ver retornos pendentes. |
| **Paciente** | Visualizar os próprios agendamentos e consultas, os procedimentos oferecidos e o próprio perfil. Não cria nem altera agendamentos. |

As restrições também são aplicadas pela API, que responde **403** quando o perfil não tem permissão.

**O paciente não se autocadastra.** Não há cadastro público: a conta do paciente é criada pela equipe da clínica (dentista ou recepcionista) na tela de Pacientes, e a tela de login orienta o paciente a procurar a recepção.

**Primeiro acesso do paciente:** a equipe não define senha. A senha inicial é o **CPF do paciente (somente números)**, e o formulário de cadastro lembra a equipe de informar isso ao paciente. No primeiro acesso, o paciente troca a senha em **Gerenciar Perfil → Alterar senha**. Quem não quiser usar o sistema não precisa fazer nada e continua sendo atendido normalmente.

## Funcionalidades implementadas
- **Login com token JWT.** A sessão fica no `sessionStorage`: sobrevive a recarregar a página, mas termina ao fechar a aba ou o navegador, exigindo novo login. Token expirado ou resposta **401** da API levam de volta à tela de login.
- **Dashboards** por perfil: equipe da clínica (pacientes, consultas e dentistas) e paciente.
- **Pacientes:** listagem com busca por nome, e-mail, CPF ou telefone; cadastro feito pela equipe; edição e exclusão.
- **Agendamentos:** criar, editar (apenas pendentes), confirmar e cancelar. A confirmação gera a consulta. O cancelamento não exclui o registro e libera o horário.
- **Histórico de consultas** com status (Pendente, Confirmada, Realizada, Cancelada, Não compareceu) e ações conforme o perfil: registrar não comparecimento, cancelar e abrir a ficha clínica (dentista).
- **Ficha clínica** (anamnese + odontograma + prontuário) e botão **Finalizar atendimento**, liberado a partir do horário da consulta.
- **Retornos pendentes:** pacientes cuja última consulta realizada passou de 6 meses e que não têm novo agendamento.
- **Serviços:** cadastro, edição e desativação (dentista e recepcionista).
- **Procedimentos:** catálogo dos serviços ativos, com busca.
- **Sobre Nós:** apresentação da clínica e do corpo clínico.
- **Perfil unificado** (`/perfil`): visualiza e edita os dados do usuário conforme o perfil e permite **alterar a senha** (senha atual + nova senha com confirmação).
- **Navbar responsiva:** menu completo em telas a partir de 1024 px e menu recolhível em telas menores; página atual destacada.

## Estrutura de páginas

| Rota | Página | Acesso |
| :--- | :--- | :--- |
| `/login` | Login | Pública |
| `/dashboard-dentista` | Dashboard da equipe (dentista e recepcionista) | Autenticado |
| `/dashboard-paciente` | Dashboard do paciente | Autenticado |
| `/pacientes` | Lista de pacientes | Autenticado |
| `/pacientes/cadastrar/interno` | Cadastro de paciente pela equipe | Dentista e recepcionista |
| `/pacientes/editar/:id` | Edição de paciente | Autenticado |
| `/agendamentos` | Agenda (dentista), agenda da clínica (recepção) ou meus agendamentos (paciente) | Autenticado |
| `/agendamentos/novo` | Novo agendamento | Dentista e recepcionista |
| `/agendamentos/editar/:id` | Edição de agendamento | Dentista e recepcionista |
| `/historico-consultas` | Histórico de consultas | Autenticado |
| `/retornos-pendentes` | Retornos pendentes | Autenticado |
| `/dentista/anamnese/:consultaId` | Ficha clínica da consulta | Autenticado |
| `/servicos`, `/servicos/novo`, `/servicos/editar/:id` | Gestão de serviços | Dentista e recepcionista |
| `/portfolio` | Procedimentos | Autenticado |
| `/sobre-nos` | Sobre Nós | Autenticado |
| `/perfil` | Perfil do usuário | Autenticado |

A rota `/` (e qualquer rota desconhecida) redireciona para o dashboard do perfil logado ou para o login.

## Organização do código
- `src/pages/` — páginas, agrupadas por módulo (agendamento, consulta, paciente, servico...)
- `src/components/` — componentes reutilizáveis (Navbar, ConfirmModal, Toast, StatusBadge, PrivateRoute)
- `src/services/` — chamadas à API (um arquivo por recurso); `api.js` configura o Axios e o token
- `src/context/AuthContext.jsx` — usuário logado
- `src/routes/AppRoutes.jsx` — rotas e restrições por perfil

## Tecnologias e bibliotecas
- React 19 (via Vite) — SPA
- React Router — rotas
- Vite — bundler e servidor de desenvolvimento
- Tailwind CSS 4 — estilização
- Axios — chamadas HTTP
- lucide-react — ícones
- jwt-decode — leitura dos dados do token (perfil e validade)

## Requisitos
- Node.js >= 20.19.0 (Vite recomenda 20.19+ ou 22.12+)
- npm
- Back-end executando em `http://localhost:8080/api`

> Observação: se o Vite mostrar aviso relacionado à versão do Node, atualize sua versão do Node.

## Como rodar localmente
1. Clone o repositório e entre na pasta do front-end:

```bash
cd Sorrisus_FrontEnd
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Isso iniciará o Vite com HMR (Hot Module Replacement) em `http://localhost:5173/`.

Outros comandos:

```bash
npm run build   # gera a versão de produção em dist/
npm run lint    # verifica o código com ESLint
```

## Integração com o backend
O projeto faz chamadas HTTP ao backend em `http://localhost:8080/api` (definido em `src/services/api.js`). O back-end precisa estar rodando e com o CORS liberado para `http://localhost:5173`.

Tokens e login
- Ao efetuar login, a resposta do backend contém `accessToken`, `userId`, `email` e `role`. O front-end guarda `token`, `user`, `role` e `userId` no `sessionStorage` (via `authService`).
- O token é enviado automaticamente em todas as requisições pelo interceptor do Axios (`Authorization: Bearer <token>`).

## Formatação e Validação
- CPF: máscara automática `xxx.xxx.xxx-xx` no formulário e na visualização. Enviado ao backend apenas com dígitos (ex: 44444444444).
- Telefone: máscara automática `(xx) xxxx-xxxx` ou `(xx) xxxxx-xxxx`, conforme o comprimento. Enviado sem máscara.
- Data de nascimento: a visualização exibe `DD/MM/YYYY`, enquanto o input é do tipo `date`.
- Datas e horários de consultas são exibidos no formato brasileiro.

## Endpoints utilizados
Cada arquivo em `src/services/` corresponde a um recurso da API: `authService`, `pacienteService`, `dentistaService`, `recepcionistaService`, `agendamentoService`, `consultaService`, `prontuarioService` e `servicoService`.

A documentação completa dos endpoints e das permissões está no README do back-end, e a collection do Postman em `Sorrisus_BackEnd/collection/Sorrisus_API_Collection.json`.

## Contribuidores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/estertrvs" title="GitHub">
        <img src="https://avatars.githubusercontent.com/u/141650957?v=4" width="100px;" alt="Foto de Ester"/><br>
        <sub>
          <b>Ester Trevisan</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/analiciafsoares" title="GitHub">
        <img src="https://avatars.githubusercontent.com/u/144076062?v=4" width="100px;" alt="Foto de Ana"/><br>
        <sub>
          <b>Ana Licia Soares</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Joaopaulomedeirosdesouza" title="GitHub">
        <img src="https://avatars.githubusercontent.com/u/148402008?v=4" width="100px;" alt="Foto de João Paulo"/><br>
        <sub>
          <b>João Paulo Medeiros</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/KesleyWilie" title="GitHub">
        <img src="https://avatars.githubusercontent.com/u/144160126?v=4" width="100px;" alt="Foto de Kesley"/><br>
        <sub>
          <b>Kesley Wilie</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/GeorgeAdOliveira" title="GitHub">
        <img src="https://avatars.githubusercontent.com/u/143577407?v=4" width="100px;" alt="Foto de George"/><br>
        <sub>
          <b>George Oliveira</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

---

**Instituto Federal da Paraíba (IFPB) — Campus Monteiro.** Projeto iniciado nas disciplinas de **Projeto I** e **Projeto II** e continuado como **Trabalho de Conclusão de Curso**.
