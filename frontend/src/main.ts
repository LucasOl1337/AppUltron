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

const resolveApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/+$/, "");
  }

  return "http://localhost:4000/api";
};

const API_BASE_URL = resolveApiBaseUrl();
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app container");
}

const toIsoDate = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

const buildDateOptions = (
  daysAhead: number,
): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    let prefix = "";
    if (dayOffset === 0) {
      prefix = "Hoje";
    } else if (dayOffset === 1) {
      prefix = "Amanha";
    }

    const dateLabel = formatDateLabel(date).replace(".", "");
    options.push({
      value: toIsoDate(date),
      label: prefix ? `${prefix} (${dateLabel})` : dateLabel,
    });
  }
  return options;
};

const state = {
  token: localStorage.getItem("appultron-token") ?? "",
  user: null as User | null,
  selectedDoctorId: "" as string,
  activeTab: "consultas" as "consultas" | "exames",
  selectedDate: toIsoDate(new Date()),
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

const authTemplate = () => `
  <main class="shell">
    <section class="card">
      <h1>AppUltron</h1>
      <p class="subtitle">Esboco funcional com login e interacoes basicas</p>
      <div class="forms">
        <form id="register-form" class="form-block">
          <h2>Criar conta</h2>
          <input name="name" placeholder="Seu nome" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" minlength="6" placeholder="Senha (6+)" required />
          <button type="submit">Cadastrar</button>
        </form>
        <form id="login-form" class="form-block">
          <h2>Entrar</h2>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Login</button>
        </form>
      </div>
      <p id="feedback" class="feedback"></p>
    </section>
  </main>
`;

const dashboardTemplate = (
  user: User,
  appointments: Appointment[],
  exams: ExamResult[],
  doctors: Doctor[],
  selectedDoctor: Doctor | null,
  dateOptions: { value: string; label: string }[],
) => `
  <main class="shell dashboard-shell">
    <section class="card dashboard">
      <header class="topbar">
        <div>
          <h1>Bem-vindo, ${user.name}</h1>
          <p class="subtitle">${user.email}</p>
        </div>
        <button id="logout-button" class="secondary">Sair</button>
      </header>

      <section class="dashboard-grid">
        <section class="panel">
          <div class="panel-tabs">
            <button class="tab-button ${state.activeTab === "consultas" ? "active" : ""}" data-tab="consultas">Minhas Consultas</button>
            <button class="tab-button ${state.activeTab === "exames" ? "active" : ""}" data-tab="exames">Resultados de Exames</button>
          </div>
          ${
            state.activeTab === "consultas"
              ? `
              <p class="rule-note">Cancelamento: minimo de 1 dia e 3 horas de antecedencia.</p>
              ${
                appointments.length
                  ? appointments
                      .map(
                        (appointment) => `
                        <article class="appointment-card">
                          <div class="appointment-head">
                            <strong>${appointment.doctorName} - ${appointment.doctorSpecialty}</strong>
                            <button class="danger" data-cancel-id="${appointment.id}">Cancelar</button>
                          </div>
                          <small>${appointment.date.split("-").reverse().join("/")} as ${appointment.time}</small>
                        </article>
                      `,
                      )
                      .join("")
                  : '<p class="empty-state">Nenhuma consulta agendada.</p>'
              }
            `
              : `
              ${
                exams.length
                  ? exams
                      .map(
                        (exam) => `
                        <article class="appointment-card">
                          <div class="appointment-head">
                            <strong>${exam.examName}</strong>
                            <span class="exam-badge ${exam.status}">${exam.status}</span>
                          </div>
                          <p>${exam.resultSummary}</p>
                          <small>Data: ${exam.date.split("-").reverse().join("/")}</small>
                          <small>Consulta: ${exam.appointmentDate.split("-").reverse().join("/")} com ${exam.doctorName} (${exam.doctorSpecialty})</small>
                          <small>Laboratorio: ${exam.labName}</small>
                          <button class="secondary exam-pdf-button" data-exam-id="${exam.id}">Abrir PDF</button>
                        </article>
                      `,
                      )
                      .join("")
                  : '<p class="empty-state">Nenhum resultado de exame.</p>'
              }
            `
          }
        </section>

        <section class="panel">
          <h2>Medicos e horarios</h2>
          <form id="appointment-form" class="appointment-form">
            <select id="doctor-select" name="doctorId" required>
              <option value="">Selecione um medico</option>
              ${doctors
                .map(
                  (doctor) => `
                    <option value="${doctor.id}" ${doctor.id === state.selectedDoctorId ? "selected" : ""}>
                      ${doctor.name} - ${doctor.specialty}
                    </option>
                  `,
                )
                .join("")}
            </select>
            <label for="date-select" class="field-label">Data da consulta</label>
            <select id="date-select" name="date" required>
              ${dateOptions
                .map(
                  (option) => `
                    <option value="${option.value}" ${option.value === state.selectedDate ? "selected" : ""}>
                      ${option.label}
                    </option>
                  `,
                )
                .join("")}
            </select>
            <select id="time-select" name="time" required ${selectedDoctor ? "" : "disabled"}>
              <option value="">Selecione um horario</option>
              ${
                selectedDoctor
                  ? selectedDoctor.availableSlots
                      .map(
                        (time) => `
                          <option value="${time}">
                            ${time}
                          </option>
                        `,
                      )
                      .join("")
                  : ""
              }
            </select>
            <button type="submit">Agendar consulta</button>
          </form>
          ${
            selectedDoctor
              ? `
              <article class="doctor-details">
                <strong>${selectedDoctor.name}</strong>
                <small>Especialidade: ${selectedDoctor.specialty}</small>
                <small>Horarios disponiveis: ${selectedDoctor.availableSlots.length}</small>
              </article>
            `
              : '<p class="empty-state">Escolha um medico para ver detalhes e horarios.</p>'
          }
        </section>
      </section>
      <p id="feedback" class="feedback"></p>
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
  const registerForm =
    document.querySelector<HTMLFormElement>("#register-form");
  const loginForm = document.querySelector<HTMLFormElement>("#login-form");

  registerForm?.addEventListener(
    "submit",
    (event) =>
      void handleAuthSubmit(event, "/auth/register", { includeName: true }),
  );
  loginForm?.addEventListener(
    "submit",
    (event) => void handleAuthSubmit(event, "/auth/login"),
  );
};

const renderAuth = () => {
  app.innerHTML = authTemplate();
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

const bindDashboardEvents = () => {
  const logoutButton =
    document.querySelector<HTMLButtonElement>("#logout-button");
  const doctorSelect =
    document.querySelector<HTMLSelectElement>("#doctor-select");
  const dateSelect = document.querySelector<HTMLSelectElement>("#date-select");
  const appointmentForm =
    document.querySelector<HTMLFormElement>("#appointment-form");
  const tabButtons =
    document.querySelectorAll<HTMLButtonElement>(".tab-button");

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

  doctorSelect?.addEventListener("change", () => {
    state.selectedDoctorId = doctorSelect.value;
    void renderDashboard();
  });

  dateSelect?.addEventListener("change", () => {
    state.selectedDate = dateSelect.value;
  });

  appointmentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const doctorId = String(formData.get("doctorId") ?? "");
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");

    try {
      await apiFetch<{ appointment: Appointment }>("/appointments", {
        method: "POST",
        body: JSON.stringify({ doctorId, date, time }),
      });
      setFeedback("Consulta agendada com sucesso.");
      await renderDashboard();
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(error.message);
      }
    }
  });

  document
    .querySelectorAll<HTMLButtonElement>("[data-cancel-id]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const appointmentId = button.dataset.cancelId;
        if (!appointmentId) {
          return;
        }

        try {
          await apiFetch<{ message: string }>(
            `/appointments/${appointmentId}`,
            {
              method: "DELETE",
            },
          );
          setFeedback("Consulta cancelada com sucesso.");
          await renderDashboard();
        } catch (error) {
          if (error instanceof Error) {
            setFeedback(error.message);
          }
        }
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>(".exam-pdf-button")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const examId = button.dataset.examId;
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
    const dateOptions = buildDateOptions(14);
    if (!dateOptions.some((option) => option.value === state.selectedDate)) {
      state.selectedDate = dateOptions[0].value;
    }

    const selectedDoctor = await loadDoctorById(state.selectedDoctorId);

    app.innerHTML = dashboardTemplate(
      user,
      appointments,
      exams,
      doctors,
      selectedDoctor,
      dateOptions,
    );
    bindDashboardEvents();
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
