import "./style.css";

type User = {
  id: string;
  name: string;
  email: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  availableSlots: string[];
};

type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  startAt: string;
};

type ExamResult = {
  id: string;
  userId: string;
  examName: string;
  category: string;
  resultSummary: string;
  date: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  labName: string;
  notes: string;
  metrics: Array<{
    label: string;
    value: string;
    reference: string;
  }>;
  status: "normal" | "alerta";
};

type DateOption = {
  value: string;
  label: string;
  shortLabel: string;
};

const resolveApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/+$/, "");
  }

  return import.meta.env.DEV ? "http://localhost:4000/api" : "/api";
};

const API_BASE_URL = resolveApiBaseUrl();
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app container");
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const formatDateLabel = (date: Date): string =>
  date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

const formatLongDateLabel = (date: Date): string =>
  date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

const buildDateOptions = (daysAhead: number): DateOption[] => {
  const options: DateOption[] = [];

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    const shortLabel = formatDateLabel(date).replace(".", "");
    const prefix =
      dayOffset === 0 ? "Hoje" : dayOffset === 1 ? "Amanha" : shortLabel;

    options.push({
      value: date.toISOString().slice(0, 10),
      label: dayOffset < 2 ? `${prefix}` : shortLabel,
      shortLabel: dayOffset < 2 ? prefix : shortLabel,
    });
  }

  return options;
};

const specialtySummary = (specialty: string): string => {
  const value = specialty.toLowerCase();

  if (value.includes("pedi")) {
    return "Atenção infantil, acompanhamento e consultas com foco em acolhimento.";
  }

  if (value.includes("card")) {
    return "Monitoramento cardiovascular com acompanhamento atento e objetivo.";
  }

  if (value.includes("orto") || value.includes("trauma")) {
    return "Avaliação clínica para dores, mobilidade e tratamento funcional.";
  }

  if (value.includes("derm")) {
    return "Cuidados com pele e rotina clínica com orientação clara.";
  }

  return "Consulta completa, escuta ativa e orientação segura para o paciente.";
};

const doctorAccent = ["#1f5bff", "#2f67ff", "#1647ba", "#4f80ff"];

const icon = (name: "home" | "user" | "calendar" | "clock" | "check" | "pdf") => {
  const icons: Record<string, string> = {
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5.5v-6.25h-5V21H4a1 1 0 0 1-1-1z"></path>
      </svg>
    `,
    user: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.2 0-7.5 2.1-7.5 4.7V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1.3c0-2.6-3.3-4.7-7.5-4.7Z"></path>
      </svg>
    `,
    calendar: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v12A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-12A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12 8H5v8.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5ZM5 8h14V6.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5Z"></path>
      </svg>
    `,
    clock: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm1 4a1 1 0 0 0-2 0v5.3l3.7 2.2a1 1 0 1 0 1-1.7L13 11.7Z"></path>
      </svg>
    `,
    check: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.2 16.2 4.8 11.8l-1.4 1.4 5.8 5.8L21 7.2l-1.4-1.4z"></path>
      </svg>
    `,
    pdf: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V7h3.5ZM8 12h2.7a1.8 1.8 0 0 1 0 3.6H9.4V17H8Zm1.4 1.3v1h1.2a.5.5 0 0 0 0-1Zm4.1-1.3H16v1.2h-1.1V17h-1.4Zm4 0h2.8v1.2H18v.7h1.9V15H18v2h-1.4Z"></path>
      </svg>
    `,
  };

  return icons[name];
};

const state = {
  token: localStorage.getItem("appultron-token") ?? "",
  user: null as User | null,
  selectedDoctorId: "" as string,
  selectedExamId: "" as string,
  activeTab: "consultas" as "consultas" | "exames",
  selectedDate: new Date().toISOString().slice(0, 10),
  selectedTime: "",
};

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Erro na comunicacao com a API");
  }

  return data as T;
};

const apiFetchBlob = async (
  path: string,
  options?: RequestInit,
): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "Erro ao baixar PDF");
  }

  return response.blob();
};

const renderTopNav = (activeTab: "consultas" | "exames") => `
  <nav class="top-nav" aria-label="Navegação principal">
    <button type="button" class="nav-icon" data-tab="consultas" aria-label="Ir para consultas">
      ${icon("home")}
    </button>
    <button type="button" class="nav-pill ${activeTab === "consultas" ? "active" : ""}" data-tab="consultas">
      Consultas
    </button>
    <button type="button" class="nav-pill ${activeTab === "exames" ? "active" : ""}" data-tab="exames">
      Exames
    </button>
    <button type="button" class="nav-icon" data-action="logout" aria-label="Sair">
      ${icon("user")}
    </button>
  </nav>
`;

const renderSceneRail = () => `
  <aside class="scene-rail" aria-hidden="true">
    <div class="rail-orb rail-orb-top"></div>
    <div class="rail-orb rail-orb-bottom"></div>
    <div class="rail-word">AppUltron</div>
  </aside>
`;

const renderAuthTemplate = () => `
  <main class="page-shell auth-shell">
    <section class="scene auth-scene">
      ${renderSceneRail()}
      <div class="scene-content auth-content">
        <header class="topbar topbar-auth">
          <div class="top-brand">
            <span class="brand-mark">${icon("home")}</span>
            <div>
              <strong>AppUltron</strong>
              <small>Cadastro e acesso</small>
            </div>
          </div>
          <span class="status-chip">Clínica digital</span>
        </header>

        <section class="hero-stage auth-stage">
          <div class="hero-copy auth-copy">
            <p class="eyebrow">Acesso ao sistema</p>
            <h1>Escolha um médico para sua consulta.</h1>
            <p class="hero-blurb">
              Entre ou crie sua conta para acessar consultas, resultados e exames com a mesma base de dados do backend.
            </p>
            <div class="hero-pills">
              <span class="chip primary">${icon("calendar")} Consultas</span>
              <span class="chip">${icon("check")} Resultados</span>
              <span class="chip">${icon("pdf")} Exames</span>
            </div>
          </div>

          <section class="auth-panel">
            <article class="auth-card">
              <div class="section-title compact">
                <div>
                  <h3>Criar conta</h3>
                  <p>Use o mesmo backend do projeto.</p>
                </div>
              </div>
              <form id="register-form" class="auth-form">
                <input name="name" placeholder="Seu nome" autocomplete="name" required />
                <input name="email" type="email" placeholder="Email" autocomplete="email" required />
                <input name="password" type="password" minlength="6" placeholder="Senha (6+)" autocomplete="new-password" required />
                <button type="submit">Cadastrar</button>
              </form>
            </article>

            <article class="auth-card">
              <div class="section-title compact">
                <div>
                  <h3>Entrar</h3>
                  <p>Acesse sua área de paciente.</p>
                </div>
              </div>
              <form id="login-form" class="auth-form">
                <input name="email" type="email" placeholder="Email" autocomplete="email" required />
                <input name="password" type="password" placeholder="Senha" autocomplete="current-password" required />
                <button type="submit">Login</button>
              </form>
            </article>
          </section>
        </section>

        <p id="feedback" class="feedback"></p>
      </div>
    </section>
  </main>
`;

const renderDoctorCards = (doctors: Doctor[]) => `
  <div class="doctor-grid">
    ${doctors
      .map((doctor, index) => {
        const selected = doctor.id === state.selectedDoctorId;

        return `
          <article class="doctor-card ${selected ? "selected" : ""}" style="--doctor-accent: ${doctorAccent[index % doctorAccent.length]};">
            <div class="doctor-top">
              <div class="doctor-avatar">${escapeHtml(initials(doctor.name))}</div>
              <div class="doctor-copy">
                <p class="doctor-name">${escapeHtml(doctor.name)}</p>
                <p class="doctor-specialty">${escapeHtml(doctor.specialty)}</p>
              </div>
            </div>
            <p class="doctor-note">${escapeHtml(specialtySummary(doctor.specialty))}</p>
            <button type="button" class="doctor-action ${selected ? "active" : ""}" data-doctor-id="${doctor.id}">
              Agendar
            </button>
          </article>
        `;
      })
      .join("")}
  </div>
`;

const renderDatePills = (dateOptions: DateOption[]) => `
  <div class="date-pills">
    ${dateOptions
      .slice(0, 6)
      .map(
        (option) => `
          <button
            type="button"
            class="pill-button ${option.value === state.selectedDate ? "active" : ""}"
            data-date-value="${option.value}"
          >
            ${escapeHtml(option.shortLabel)}
          </button>
        `,
      )
      .join("")}
  </div>
`;

const renderTimePills = (slots: string[]) => `
  <div class="time-grid">
    ${slots
      .map(
        (slot) => `
          <button
            type="button"
            class="pill-button time-button ${slot === state.selectedTime ? "active" : ""}"
            data-time-value="${slot}"
          >
            ${escapeHtml(slot)}
          </button>
        `,
      )
      .join("")}
  </div>
`;

const renderSchedulePanel = (
  selectedDoctor: Doctor | null,
  dateOptions: DateOption[],
) => {
  if (!selectedDoctor) {
    return `
      <section class="schedule-panel empty-panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">Selecione um médico</p>
            <h2>Escolha um especialista para ver horários.</h2>
          </div>
        </div>
        <p class="empty-state">Nenhum médico disponível no momento.</p>
      </section>
    `;
  }

  const selectedDateLabel =
    dateOptions.find((option) => option.value === state.selectedDate)?.label ??
    state.selectedDate;
  const selectedTime = state.selectedTime || selectedDoctor.availableSlots[0] || "";
  const summaryTime = selectedTime || "Selecione um horário";

  return `
    <section class="schedule-panel">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">Selecione um dia</p>
          <h2>Horário da consulta</h2>
        </div>
        <span class="panel-badge">Disponível</span>
      </div>

      ${renderDatePills(dateOptions)}

      <div class="panel-divider"></div>

      <div>
        <p class="panel-kicker">Horários disponíveis</p>
        ${renderTimePills(selectedDoctor.availableSlots)}
      </div>

      <form id="appointment-form" class="confirm-form">
        <article class="appointment-summary">
          <div class="summary-avatar">${escapeHtml(initials(selectedDoctor.name))}</div>
          <div class="summary-copy">
            <strong>${escapeHtml(selectedDoctor.name)}</strong>
            <small>${escapeHtml(selectedDoctor.specialty)}</small>
            <span class="summary-meta">
              ${escapeHtml(selectedDateLabel)} • ${escapeHtml(summaryTime)}
            </span>
          </div>
        </article>
        <button type="submit">Agendar consulta</button>
      </form>
    </section>
  `;
};

const renderAppointmentList = (appointments: Appointment[]) => `
  <section class="details-block">
    <div class="section-title">
      <div>
        <h3>Minhas consultas</h3>
        <p>Cancelamento com antecedência mínima de 1 dia e 3 horas.</p>
      </div>
    </div>

    <div class="appointments-list">
      ${
        appointments.length
          ? appointments
              .map(
                (appointment) => `
                  <article class="list-card">
                    <div class="row">
                      <div>
                        <strong>${escapeHtml(appointment.doctorName)}</strong>
                        <small>${escapeHtml(appointment.doctorSpecialty)}</small>
                      </div>
                      <button type="button" class="danger" data-cancel-id="${appointment.id}">
                        Cancelar
                      </button>
                    </div>
                    <small>${escapeHtml(appointment.date.split("-").reverse().join("/"))} às ${escapeHtml(appointment.time)}</small>
                  </article>
                `,
              )
              .join("")
          : '<p class="empty-state">Nenhuma consulta agendada.</p>'
      }
    </div>
  </section>
`;

const renderExamCards = (exams: ExamResult[]) => `
  <div class="doctor-grid exam-grid">
    ${exams
      .map((exam, index) => {
        const selected = exam.id === state.selectedExamId;

        return `
          <article class="doctor-card exam-card ${selected ? "selected" : ""}" style="--doctor-accent: ${doctorAccent[index % doctorAccent.length]};">
            <div class="doctor-top">
              <div class="doctor-avatar exam-avatar">${escapeHtml(exam.status === "alerta" ? "!" : "✓")}</div>
              <div class="doctor-copy">
                <p class="doctor-name">${escapeHtml(exam.examName)}</p>
                <p class="doctor-specialty ${exam.status}">${escapeHtml(exam.status === "normal" ? "Normal" : "Alerta")}</p>
              </div>
            </div>
            <p class="doctor-note">${escapeHtml(exam.resultSummary)}</p>
            <button type="button" class="doctor-action ${selected ? "active" : ""}" data-exam-id="${exam.id}">
              Ver detalhe
            </button>
          </article>
        `;
      })
      .join("")}
  </div>
`;

const renderExamPanel = (exam: ExamResult | null) => {
  if (!exam) {
    return `
      <section class="schedule-panel empty-panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">Resultados de exames</p>
            <h2>Nenhum resultado disponível.</h2>
          </div>
        </div>
        <p class="empty-state">Assim que houver exames vinculados ao usuário, eles aparecerão aqui.</p>
      </section>
    `;
  }

  return `
    <section class="schedule-panel">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">Resultado em destaque</p>
          <h2>${escapeHtml(exam.examName)}</h2>
        </div>
        <span class="panel-badge ${exam.status}">${escapeHtml(exam.status === "normal" ? "Normal" : "Alerta")}</span>
      </div>

      <article class="exam-preview">
        <div class="summary-avatar">${icon("check")}</div>
        <div class="summary-copy">
          <strong>${escapeHtml(exam.doctorName)}</strong>
          <small>${escapeHtml(exam.doctorSpecialty)}</small>
          <span class="summary-meta">
            ${escapeHtml(exam.appointmentDate.split("-").reverse().join("/"))}
            • ${escapeHtml(exam.labName)}
          </span>
        </div>
      </article>

      <div class="exam-metrics">
        ${exam.metrics
          .slice(0, 3)
          .map(
            (metric) => `
              <div class="metric-row">
                <span>${escapeHtml(metric.label)}</span>
                <strong>${escapeHtml(metric.value)}</strong>
                <small>${escapeHtml(metric.reference)}</small>
              </div>
            `,
          )
          .join("")}
      </div>

      <button type="button" class="secondary pdf-button" data-exam-pdf="${exam.id}">
        ${icon("pdf")} Abrir PDF
      </button>
    </section>
  `;
};

const renderExamList = (exams: ExamResult[]) => `
  <section class="details-block">
    <div class="section-title">
      <div>
        <h3>Resultados de exames</h3>
        <p>Selecione um resultado para abrir o PDF e ver os dados principais.</p>
      </div>
    </div>

    <div class="appointments-list">
      ${
        exams.length
          ? exams
              .map(
                (exam) => `
                  <article class="list-card exam-list-card ${exam.id === state.selectedExamId ? "selected" : ""}">
                    <div class="row">
                      <div>
                        <strong>${escapeHtml(exam.examName)}</strong>
                        <small>${escapeHtml(exam.doctorName)} • ${escapeHtml(exam.doctorSpecialty)}</small>
                      </div>
                      <span class="panel-badge ${exam.status}">${escapeHtml(exam.status === "normal" ? "Normal" : "Alerta")}</span>
                    </div>
                    <small>${escapeHtml(exam.date.split("-").reverse().join("/"))} • ${escapeHtml(exam.labName)}</small>
                    <div class="actions">
                      <button type="button" class="secondary" data-exam-id="${exam.id}">
                        Ver detalhe
                      </button>
                      <button type="button" class="secondary pdf-button" data-exam-pdf="${exam.id}">
                        ${icon("pdf")} PDF
                      </button>
                    </div>
                  </article>
                `,
              )
              .join("")
          : '<p class="empty-state">Nenhum resultado de exame.</p>'
      }
    </div>
  </section>
`;

const renderDashboardTemplate = (
  user: User,
  appointments: Appointment[],
  exams: ExamResult[],
  doctors: Doctor[],
  selectedDoctor: Doctor | null,
  selectedExam: ExamResult | null,
  dateOptions: DateOption[],
) => `
  <main class="page-shell app-shell">
    <section class="scene app-scene">
      ${renderSceneRail()}
      <div class="scene-content app-content">
        <header class="topbar">
          ${renderTopNav(state.activeTab)}
          <div class="user-chip">
            <strong>Olá, ${escapeHtml(user.name)}</strong>
            <small>${escapeHtml(user.email)}</small>
          </div>
        </header>

        <section class="hero-stage">
          <div class="hero-copy">
            <p class="eyebrow">${state.activeTab === "consultas" ? "Agenda médica" : "Resultados clínicos"}</p>
            <h1>
              ${
                state.activeTab === "consultas"
                  ? "Escolha um médico para sua consulta."
                  : "Veja seus resultados e exames."
              }
            </h1>
            <p class="hero-blurb">
              ${
                state.activeTab === "consultas"
                  ? "Selecione o especialista, escolha o dia, marque um horário e confirme tudo em um fluxo visual mais próximo do layout do grupo."
                  : "Acompanhe os exames gerados para o usuário e abra o PDF a qualquer momento."
              }
            </p>

            ${
              state.activeTab === "consultas"
                ? renderDoctorCards(doctors)
                : renderExamCards(exams)
            }
          </div>

          ${
            state.activeTab === "consultas"
              ? renderSchedulePanel(selectedDoctor, dateOptions)
              : renderExamPanel(selectedExam)
          }
        </section>

        ${
          state.activeTab === "consultas"
            ? renderAppointmentList(appointments)
            : renderExamList(exams)
        }

        <p id="feedback" class="feedback"></p>
      </div>
    </section>
  </main>
`;

const setFeedback = (message: string) => {
  const feedback = document.querySelector<HTMLParagraphElement>("#feedback");
  if (feedback) {
    feedback.textContent = message;
  }
};

const persistToken = (token: string) => {
  state.token = token;
  localStorage.setItem("appultron-token", token);
};

const clearSession = () => {
  state.token = "";
  state.user = null;
  localStorage.removeItem("appultron-token");
};

const handleAuthSubmit = async (
  event: Event,
  path: "/auth/register" | "/auth/login",
  extra?: { includeName: boolean },
) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);

  const body: Record<string, string> = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  if (extra?.includeName) {
    body.name = String(formData.get("name") ?? "");
  }

  try {
    const result = await apiFetch<{ token: string; user: User }>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });

    persistToken(result.token);
    state.user = result.user;
    await renderDashboard();
  } catch (error) {
    if (error instanceof Error) {
      setFeedback(error.message);
    }
  }
};

const bindAuthEvents = () => {
  const registerForm = document.querySelector<HTMLFormElement>("#register-form");
  const loginForm = document.querySelector<HTMLFormElement>("#login-form");

  registerForm?.addEventListener("submit", (event) =>
    void handleAuthSubmit(event, "/auth/register", { includeName: true }),
  );

  loginForm?.addEventListener("submit", (event) =>
    void handleAuthSubmit(event, "/auth/login"),
  );
};

const renderAuth = () => {
  app.innerHTML = renderAuthTemplate();
  bindAuthEvents();
};

const loadMe = async (): Promise<User> => {
  const result = await apiFetch<{ user: User }>("/auth/me");
  return result.user;
};

const loadMyAppointments = async (): Promise<Appointment[]> => {
  const result = await apiFetch<{ appointments: Appointment[] }>(
    "/appointments/my",
  );
  return result.appointments;
};

const loadExamResults = async (): Promise<ExamResult[]> => {
  const result = await apiFetch<{ exams: ExamResult[] }>("/exams/my");
  return result.exams;
};

const loadDoctors = async (): Promise<Doctor[]> => {
  const result = await apiFetch<{ doctors: Doctor[] }>("/appointments/doctors");
  return result.doctors;
};

const loadDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  if (!doctorId) {
    return null;
  }

  const result = await apiFetch<{ doctor: Doctor }>(
    `/appointments/doctors/${doctorId}`,
  );
  return result.doctor;
};

const bindDashboardEvents = (doctors: Doctor[], exams: ExamResult[]) => {
  const logoutButton = document.querySelector<HTMLButtonElement>(
    '[data-action="logout"]',
  );
  const tabButtons = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const doctorButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-doctor-id]",
  );
  const dateButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-date-value]",
  );
  const timeButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-time-value]",
  );
  const examButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-exam-id]",
  );
  const pdfButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-exam-pdf]",
  );
  const appointmentForm =
    document.querySelector<HTMLFormElement>("#appointment-form");

  logoutButton?.addEventListener("click", () => {
    clearSession();
    renderAuth();
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      if (tab === "consultas" || tab === "exames") {
        state.activeTab = tab;
        void renderDashboard();
      }
    });
  });

  doctorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const doctorId = button.dataset.doctorId;
      if (!doctorId) {
        return;
      }

      state.selectedDoctorId = doctorId;
      const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
      state.selectedTime = selectedDoctor?.availableSlots[0] ?? "";
      void renderDashboard();
    });
  });

  dateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const date = button.dataset.dateValue;
      if (!date) {
        return;
      }

      state.selectedDate = date;
      void renderDashboard();
    });
  });

  timeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const time = button.dataset.timeValue;
      if (!time) {
        return;
      }

      state.selectedTime = time;
      void renderDashboard();
    });
  });

  examButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const examId = button.dataset.examId;
      if (!examId) {
        return;
      }

      state.selectedExamId = examId;
      void renderDashboard();
    });
  });

  pdfButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const examId = button.dataset.examPdf;
      if (!examId) {
        return;
      }

      try {
        const pdfBlob = await apiFetchBlob(`/exams/${examId}/pdf`);
        const objectUrl = URL.createObjectURL(pdfBlob);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      } catch (error) {
        if (error instanceof Error) {
          setFeedback(error.message);
        }
      }
    });
  });

  appointmentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === state.selectedDoctorId,
    );
    const time = state.selectedTime || selectedDoctor?.availableSlots[0] || "";

    if (!selectedDoctor) {
      setFeedback("Selecione um médico antes de agendar.");
      return;
    }

    if (!time) {
      setFeedback("Selecione um horário antes de agendar.");
      return;
    }

    try {
      await apiFetch<{ appointment: Appointment }>("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: state.selectedDate,
          time,
        }),
      });

      setFeedback("Consulta agendada com sucesso.");
      await renderDashboard();
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(error.message);
      }
    }
  });
};

const renderDashboard = async () => {
  try {
    const [user, appointments, exams, doctors] = await Promise.all([
      loadMe(),
      loadMyAppointments(),
      loadExamResults(),
      loadDoctors(),
    ]);

    state.user = user;

    if (!state.selectedDoctorId && doctors.length > 0) {
      state.selectedDoctorId = doctors[0].id;
    }

    const dateOptions = buildDateOptions(7);
    if (!dateOptions.some((option) => option.value === state.selectedDate)) {
      state.selectedDate = dateOptions[0]?.value ?? state.selectedDate;
    }

    const selectedDoctor = await loadDoctorById(state.selectedDoctorId);
    if (
      selectedDoctor &&
      !selectedDoctor.availableSlots.includes(state.selectedTime)
    ) {
      state.selectedTime = selectedDoctor.availableSlots[0] ?? "";
    }

    if (!state.selectedExamId && exams.length > 0) {
      state.selectedExamId = exams[0].id;
    }

    const selectedExam =
      exams.find((exam) => exam.id === state.selectedExamId) ?? exams[0] ?? null;

    app.innerHTML = renderDashboardTemplate(
      user,
      appointments,
      exams,
      doctors,
      selectedDoctor,
      selectedExam,
      dateOptions,
    );

    bindDashboardEvents(doctors, exams);
  } catch {
    clearSession();
    renderAuth();
  }
};

const boot = async () => {
  if (!state.token) {
    renderAuth();
    return;
  }

  await renderDashboard();
};

void boot();
