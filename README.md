# AppUltron - Esqueleto Node + TypeScript

Projeto inicial com frontend e backend separados para facilitar evolucao de design sem acoplar a API.
Usuarios cadastrados ficam persistidos em `backend/data/users.json` (senha armazenada como hash).
Exames ficam em `backend/data/exam-catalog.json` (catalogo de simulacao) e `backend/data/user-exams.json` (geracao por usuario).

## Estrutura

- `frontend`: site funcional (Vite + TypeScript) com cadastro, login, feed e curtidas.
- `backend`: API modular (Express + TypeScript) com modulos `auth` e `interactions`.

## Como rodar

1. Instale dependencias:
   - `npm install`
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
2. Configure backend:
   - copie `backend/.env.example` para `backend/.env`
3. Suba frontend + backend com launcher unico:
   - `npm run dev`
   - o launcher limpa automaticamente as portas `4000` e `5173` antes de iniciar

Alternativa (separado em 2 terminais):

- `npm run dev:backend`
- `npm run dev:frontend`

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000/api`

## Deploy rapido (gratis)

### Backend (Render)

1. Suba este projeto no GitHub.
2. No Render, crie um novo `Blueprint` apontando para este repo (ele detecta `render.yaml`).
3. Configure `CORS_ORIGIN` com a URL final do frontend (ex: `https://appultron.vercel.app`).
4. Deploy.

### Frontend (Vercel)

1. Importe o repo no Vercel.
2. Configure o `Root Directory` como `frontend`.
3. Em `Environment Variables`, configure:
   - `VITE_API_URL=https://SEU-BACKEND.onrender.com/api`
4. Deploy.
5. Depois do deploy, volte no Render e ajuste `CORS_ORIGIN` para a URL da Vercel.

### AWS (um unico container)

Esse repo agora pode subir como uma unica imagem Docker:

1. O backend serve o `frontend/dist` quando ele existe.
2. O frontend usa `/api` por padrao, entao o mesmo host responde site e API.
3. O `Dockerfile` da raiz prepara a imagem para `AWS App Runner`, `Elastic Beanstalk` ou `EC2`.

Variaveis importantes:

- `PORT`: a porta do container; no AWS App Runner normalmente vem do ambiente do servico.
- `JWT_SECRET`: defina um valor forte em producao.
- `CORS_ORIGIN`: use a URL publica final do servico, ou o dominio customizado quando existir.

Observacao:

- A persistencia atual ainda e baseada em arquivos locais em `backend/data`. Para dados duraveis no AWS, o proximo passo e migrar isso para S3, EFS ou banco gerenciado.

### AWS Amplify + backend separado

Se você quiser usar o Amplify para a camada visual, o fluxo recomendado é:

1. Deploy do backend em um serviço HTTP da AWS, como App Runner.
2. Deploy do `frontend` no Amplify usando o `amplify.yml` da raiz.
3. Configurar `VITE_API_URL` no Amplify com a URL pública do backend.

Observação:

- O Amplify hospeda bem o frontend estático, mas este projeto não coloca o backend Express dentro do Amplify sem uma adaptação maior da arquitetura.

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/interactions` (Bearer token)
- `POST /api/interactions` (Bearer token)
- `POST /api/interactions/:postId/like` (Bearer token)
- `GET /api/appointments/doctors` (Bearer token)
- `GET /api/appointments/doctors/:doctorId` (Bearer token)
- `GET /api/appointments/my` (Bearer token)
- `POST /api/appointments` (Bearer token)
- `DELETE /api/appointments/:appointmentId` (Bearer token, 1 dia e 3 horas de antecedencia)
- `GET /api/exams/my` (Bearer token)
- `GET /api/exams/:examId/pdf` (Bearer token)
