import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpenCheck,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  FileText,
  HeartHandshake,
  HeartPulse,
  Info,
  LifeBuoy,
  LockKeyhole,
  LogIn,
  LogOut,
  MessageCircleHeart,
  Pause,
  PhoneCall,
  Play,
  School,
  Send,
  ShieldAlert,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Wind,
  Zap,
} from 'lucide-react'
import heroImg from './assets/hero.png'
import './App.css'

const STORAGE_KEYS = {
  users: 'mindup:users',
  session: 'mindup:session',
}

const DEMO_CHECKIN_IDS = new Set([101, 102, 103, 104, 105, 106, 107])

const moods = [
  {
    id: 'leve',
    label: 'Leve',
    icon: SmilePlus,
    score: 86,
    color: '#42b8a8',
    summary: 'energia boa e mente mais clara',
  },
  {
    id: 'neutro',
    label: 'Neutro',
    icon: Activity,
    score: 68,
    color: '#68a8df',
    summary: 'dia estável, com espaço para cuidado',
  },
  {
    id: 'ansioso',
    label: 'Ansioso',
    icon: Zap,
    score: 44,
    color: '#f2a65a',
    summary: 'sinais de aceleração e preocupação',
  },
  {
    id: 'sobrecarregado',
    label: 'Sobrecarregado',
    icon: HeartPulse,
    score: 28,
    color: '#de6c7b',
    summary: 'atenção extra para descanso e apoio',
  },
]

const exercises = [
  {
    id: 'respiracao',
    icon: Wind,
    title: 'Respiração 4-4',
    duration: '2 min',
    text: 'Inspire por 4 segundos, segure por 4 e solte devagar.',
  },
  {
    id: 'foco',
    icon: Target,
    title: 'Foco gentil',
    duration: '3 min',
    text: 'Escolha uma tarefa pequena e tire distrações da tela.',
  },
  {
    id: 'relaxamento',
    icon: TimerReset,
    title: 'Relaxamento',
    duration: '5 min',
    text: 'Solte ombros, mandíbula e mãos. Repita até o corpo desacelerar.',
  },
]

const habits = [
  { id: 'agua', label: 'Beber água', icon: CheckCircle2 },
  { id: 'pausa', label: 'Fazer uma pausa', icon: Pause },
  { id: 'sono', label: 'Preparar o sono', icon: CalendarCheck },
  { id: 'apoio', label: 'Falar com alguém seguro', icon: HeartHandshake },
]

const firstPosts = [
  {
    id: 1,
    author: 'Anônimo',
    mood: 'Ansioso',
    text: 'Hoje a prova pareceu grande demais. Fiz uma pausa e consegui voltar com mais calma.',
  },
  {
    id: 2,
    author: 'Anônimo',
    mood: 'Neutro',
    text: 'Separar as tarefas por blocos pequenos me ajudou a não travar.',
  },
]

const pitchCards = [
  {
    icon: AlertTriangle,
    title: 'Problema',
    text: 'Ansiedade, pressão escolar, comparação nas redes sociais e medo do futuro afetam autoestima, estudos e relações.',
  },
  {
    icon: Sparkles,
    title: 'Solução',
    text: 'Uma plataforma preventiva para registrar emoções, criar rotinas de autocuidado e encontrar apoio seguro.',
  },
  {
    icon: Users,
    title: 'Público-alvo',
    text: 'Adolescentes, estudantes e jovens em ambientes escolares com pressão acadêmica ou sobrecarga emocional.',
  },
  {
    icon: TrendingUp,
    title: 'Impacto social',
    text: 'Ajuda a diminuir isolamento, prevenir crises, incentivar conversas e melhorar a relação dos jovens com a escola.',
  },
]

const objectives = [
  'reduzir estresse e ansiedade',
  'incentivar autocuidado diário',
  'ajudar jovens a identificar emoções',
  'facilitar acesso à informação emocional',
  'aproximar escolas e redes de apoio',
]

const schoolFlow = [
  {
    icon: HeartPulse,
    title: 'Aluno registra',
    text: 'Check-ins diários ajudam a perceber sinais antes da crise.',
  },
  {
    icon: ShieldAlert,
    title: 'Sistema identifica',
    text: 'Padrões de sobrecarga acionam orientações preventivas.',
  },
  {
    icon: School,
    title: 'Escola acolhe',
    text: 'Com consentimento, a escola pode orientar uma rede humana de apoio.',
  },
]

const fallbackMessage =
  'Não consegui salvar esse conteúdo agora. Tente escrever de forma mais curta e sem dados pessoais.'

function fixPortugueseFragments(value) {
  return String(value ?? '')
    .replace(/\bAnonimo\b/g, 'Anônimo')
    .replace(/\banonimo\b/g, 'anônimo')
    .replace(/\bAnonima\b/g, 'Anônima')
    .replace(/\banonima\b/g, 'anônima')
    .replace(/\bAnonimas\b/g, 'Anônimas')
    .replace(/\banonimas\b/g, 'anônimas')
}

function normalizePost(post) {
  return {
    ...post,
    author: fixPortugueseFragments(post.author || 'Anônimo'),
    mood: fixPortugueseFragments(post.mood),
    text: fixPortugueseFragments(post.text),
  }
}

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const legacyKey = key.replace('mindup:', 'mindspace:')
    const stored =
      window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeStorage(key) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(key)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getDayLabel(date) {
  const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '')

  return `${label.charAt(0).toUpperCase()}${label.slice(1, 3)}`
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'agora'
  }
}

function cleanText(value, limit = 260) {
  return value.replace(/\s+/g, ' ').trim().slice(0, limit)
}

function normalizeEmail(value) {
  return cleanText(value, 120).toLowerCase()
}

function createUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultUserData() {
  return {
    privacyConsent: false,
    checkins: [],
    habits: ['agua', 'pausa'],
    posts: firstPosts.map(normalizePost),
  }
}

function isDemoCheckin(entry) {
  return (
    DEMO_CHECKIN_IDS.has(entry?.id) &&
    String(entry?.createdAt ?? '').startsWith('2026-05-')
  )
}

function normalizeUserData(data = {}) {
  const defaults = createDefaultUserData()

  return {
    privacyConsent: Boolean(data.privacyConsent),
    checkins: Array.isArray(data.checkins)
      ? data.checkins
          .filter((entry) => !isDemoCheckin(entry))
          .map((entry) => ({ ...entry }))
      : defaults.checkins,
    habits: Array.isArray(data.habits) ? [...data.habits] : defaults.habits,
    posts: Array.isArray(data.posts)
      ? data.posts.map(normalizePost)
      : defaults.posts,
  }
}

function normalizeUser(user) {
  const email = normalizeEmail(user?.email)

  return {
    id: user?.id || createUserId(),
    name: cleanText(user?.name || email.split('@')[0] || 'Usuário', 80),
    email,
    passwordHash: String(user?.passwordHash || ''),
    createdAt: user?.createdAt || new Date().toISOString(),
    updatedAt: user?.updatedAt || user?.createdAt || new Date().toISOString(),
    data: normalizeUserData(user?.data),
  }
}

function readUsers() {
  const users = readStorage(STORAGE_KEYS.users, [])

  return Array.isArray(users)
    ? users.map(normalizeUser).filter((user) => user.email)
    : []
}

function mergeUsers(primaryUsers, secondaryUsers) {
  const usersByEmail = new Map()

  primaryUsers.map(normalizeUser).forEach((user) => {
    usersByEmail.set(user.email, user)
  })

  secondaryUsers.map(normalizeUser).forEach((user) => {
    const existingUser = usersByEmail.get(user.email)
    const existingTime = Date.parse(existingUser?.updatedAt || 0)
    const userTime = Date.parse(user.updatedAt || 0)

    if (!existingUser || userTime > existingTime) {
      usersByEmail.set(user.email, user)
    }
  })

  return Array.from(usersByEmail.values())
}

async function readServerUsers() {
  if (typeof fetch === 'undefined') {
    return null
  }

  const response = await fetch('/api/users', {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    return null
  }

  const payload = await response.json()
  return Array.isArray(payload.users)
    ? payload.users.map(normalizeUser).filter((user) => user.email)
    : []
}

async function writePersistentUsers(users) {
  const normalizedUsers = users.map(normalizeUser).filter((user) => user.email)

  writeStorage(STORAGE_KEYS.users, normalizedUsers)

  try {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: normalizedUsers }),
    })

    return response.ok
  } catch {
    return false
  }
}

async function readPersistentUsers() {
  const localUsers = readUsers()

  try {
    const serverUsers = await readServerUsers()

    if (serverUsers) {
      const mergedUsers = mergeUsers(serverUsers, localUsers)

      writeStorage(STORAGE_KEYS.users, mergedUsers)

      if (mergedUsers.length !== serverUsers.length) {
        await writePersistentUsers(mergedUsers)
      }

      return mergedUsers
    }
  } catch {
    return localUsers
  }

  return localUsers
}

function readInitialAuth() {
  const users = readUsers()
  const sessionId = readStorage(STORAGE_KEYS.session, null)
  const currentUserId = users.some((user) => user.id === sessionId)
    ? sessionId
    : null

  if (sessionId && !currentUserId) {
    removeStorage(STORAGE_KEYS.session)
  }

  return { users, currentUserId }
}

async function createPasswordHash(value) {
  const normalized = String(value)

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const payload = new TextEncoder().encode(normalized)
    const digest = await window.crypto.subtle.digest('SHA-256', payload)

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  let hash = 0

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index)
    hash |= 0
  }

  return `local-${Math.abs(hash)}-${normalized.length}`
}

function getFirstName(name) {
  return cleanText(name, 80).split(/\s+/)[0] || 'usuário'
}

function isRunningStandalone() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isPageScrolled() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.scrollY > 24
}

function detectUnsafePost(text) {
  const personalData = /(telefone|whatsapp|instagram|endereço|endereco|cpf|rg|e-mail|email)/i
  const aggression = /(humilhar|ameaçar|ameacar|ódio|odio|bullying|xingar|expor alguém|expor alguem)/i
  const crisis = /(suicídio|suicidio|suicidar|me matar|não quero viver|nao quero viver|sumir para sempre)/i

  if (crisis.test(text)) {
    return {
      type: 'urgent',
      message:
        'Seu texto parece indicar sofrimento intenso. O post não foi publicado. Procure agora uma pessoa de confiança, o CVV 188 ou o SAMU 192 em emergência.',
    }
  }

  if (personalData.test(text)) {
    return {
      type: 'review',
      message:
        'Evite publicar dados pessoais. O espaço anônimo deve proteger você e outras pessoas.',
    }
  }

  if (aggression.test(text)) {
    return {
      type: 'review',
      message:
        'O conteúdo precisa ser acolhedor. Reescreva sem ataques, exposição ou ameaças.',
    }
  }

  return null
}

function App() {
  const initialAuth = useMemo(() => readInitialAuth(), [])
  const initialUserData = useMemo(() => {
    const initialUser = initialAuth.users.find(
      (user) => user.id === initialAuth.currentUserId,
    )

    return normalizeUserData(initialUser?.data)
  }, [initialAuth])

  const [auth, setAuth] = useState(initialAuth)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isStandaloneApp, setIsStandaloneApp] = useState(isRunningStandalone)
  const [hasScrolled, setHasScrolled] = useState(isPageScrolled)
  const [selectedMood, setSelectedMood] = useState('ansioso')
  const [activeExercise, setActiveExercise] = useState('respiracao')
  const [breathing, setBreathing] = useState(false)
  const [note, setNote] = useState('')
  const [anonymousDraft, setAnonymousDraft] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [moderationMessage, setModerationMessage] = useState('')
  const [editingCheckinId, setEditingCheckinId] = useState(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState(null)
  const [privacyConsent, setPrivacyConsent] = useState(
    initialUserData.privacyConsent,
  )
  const [checkins, setCheckins] = useState(initialUserData.checkins)
  const [communityPosts, setCommunityPosts] = useState(initialUserData.posts)
  const [completedHabits, setCompletedHabits] = useState(initialUserData.habits)

  const currentUser =
    auth.users.find((user) => user.id === auth.currentUserId) ?? null
  const currentMood =
    moods.find((mood) => mood.id === selectedMood) ?? moods[0]
  const currentExercise =
    exercises.find((exercise) => exercise.id === activeExercise) ?? exercises[0]
  const chartData = checkins.slice(-7)
  const recentCheckins = checkins.slice(-4).reverse()
  const selectedHistoryEntry =
    checkins.find((entry) => entry.id === selectedHistoryId) ?? recentCheckins[0]
  const overloadedDays = chartData.filter((item) => item.score < 50).length
  const currentStress = clamp(
    100 - currentMood.score + (selectedMood === 'sobrecarregado' ? 9 : 0),
    12,
    96,
  )
  const moodAverage = Math.round(
    chartData.length
      ? chartData.reduce((total, item) => total + item.score, 0) /
          chartData.length
      : 0,
  )
  const stressAverage = Math.round(
    chartData.length
      ? chartData.reduce((total, item) => total + item.stress, 0) /
          chartData.length
      : 0,
  )
  const habitProgress = Math.round((completedHabits.length / habits.length) * 100)

  useEffect(() => {
    if (!auth.currentUserId || !storageReady) {
      return
    }

    const storedUsers = readUsers()
    const targetUser = storedUsers.find((user) => user.id === auth.currentUserId)

    if (!targetUser) {
      return
    }

    const nextData = {
      privacyConsent,
      checkins,
      habits: completedHabits,
      posts: communityPosts.map(normalizePost),
    }
    const nextUsers = storedUsers.map((user) =>
      user.id === auth.currentUserId
        ? {
            ...user,
            data: nextData,
            updatedAt: new Date().toISOString(),
          }
        : user,
    )

    writePersistentUsers(nextUsers)
  }, [
    auth.currentUserId,
    checkins,
    communityPosts,
    completedHabits,
    privacyConsent,
    storageReady,
  ])

  useEffect(() => {
    if (!statusMessage) {
      return undefined
    }

    const timer = window.setTimeout(() => setStatusMessage(''), 3800)
    return () => window.clearTimeout(timer)
  }, [statusMessage])

  const supportTips = useMemo(() => {
    if (currentMood.score < 50 || overloadedDays >= 3) {
      return [
        {
          icon: Pause,
          title: 'Pausa protetora',
          text: 'Afaste-se por alguns minutos, respire e retome apenas uma tarefa.',
        },
        {
          icon: HeartHandshake,
          title: 'Rede de apoio',
          text: 'Compartilhe o que sente com alguém confiável ou com a escola.',
        },
        {
          icon: CalendarCheck,
          title: 'Rotina menor',
          text: 'Troque a lista gigante por três prioridades possíveis para hoje.',
        },
      ]
    }

    return [
      {
        icon: Sparkles,
        title: 'Manter o ritmo',
        text: 'Registre uma pequena vitória para reforçar hábitos saudáveis.',
      },
      {
        icon: Wind,
        title: 'Respirar antes da pressão',
        text: 'Faça um ciclo curto antes de estudos, prova ou conversa difícil.',
      },
      {
        icon: Target,
        title: 'Foco com descanso',
        text: 'Intercale 25 minutos de estudo com uma pausa real de 5 minutos.',
      },
    ]
  }, [currentMood, overloadedDays])

  const alertStatus =
    currentMood.score < 35 || overloadedDays >= 3
      ? 'Alerta preventivo ativo'
      : currentMood.score < 50
        ? 'Atenção recomendada'
        : 'Rotina emocional estável'

  const alertText =
    currentMood.score < 35 || overloadedDays >= 3
      ? 'Os registros indicam sobrecarga frequente. O MindUp incentiva buscar apoio profissional, conversar com um adulto de confiança ou acionar a escola.'
      : currentMood.score < 50
        ? 'Seu registro mostra tensão acima do normal. Uma pausa guiada e uma conversa segura podem ajudar antes que a pressão cresça.'
        : 'Os registros da semana estão equilibrados. Continue acompanhando padrões e mantendo hábitos de autocuidado.'
  const canInstallApp = Boolean(installPrompt) && !isStandaloneApp

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const updateStandaloneStatus = () => setIsStandaloneApp(isRunningStandalone())
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsStandaloneApp(true)
      setStatusMessage('MindUp instalado como aplicativo.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', updateStandaloneStatus)
    } else {
      standaloneQuery.addListener(updateStandaloneStatus)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)

      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', updateStandaloneStatus)
      } else {
        standaloneQuery.removeListener(updateStandaloneStatus)
      }
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) {
      return
    }

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice

      if (choice?.outcome === 'accepted') {
        setStatusMessage('MindUp instalado como aplicativo.')
      }
    } catch {
      setStatusMessage('Não consegui iniciar a instalação agora.')
    } finally {
      setInstallPrompt(null)
    }
  }

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(isPageScrolled())
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })

    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  const callPhoneNumber = (number, event) => {
    event.preventDefault()
    window.location.href = `tel:${number}`
  }

  const loadUserData = useCallback((user) => {
    const data = normalizeUserData(user.data)

    setSelectedMood('ansioso')
    setActiveExercise('respiracao')
    setBreathing(false)
    setNote('')
    setAnonymousDraft('')
    setModerationMessage('')
    setEditingCheckinId(null)
    setSelectedHistoryId(null)
    setPrivacyConsent(data.privacyConsent)
    setCheckins(data.checkins)
    setCompletedHabits(data.habits)
    setCommunityPosts(data.posts)
  }, [])

  useEffect(() => {
    let isActive = true

    readPersistentUsers()
      .then((users) => {
        if (!isActive) {
          return
        }

        const sessionId = readStorage(STORAGE_KEYS.session, null)
        const currentUserId = users.some((user) => user.id === sessionId)
          ? sessionId
          : null

        if (sessionId && !currentUserId) {
          removeStorage(STORAGE_KEYS.session)
        }

        setAuth({ users, currentUserId })

        if (currentUserId) {
          const user = users.find((item) => item.id === currentUserId)
          if (user) {
            loadUserData(user)
          }
        }

        setStorageReady(true)
      })
      .catch(() => {
        if (isActive) {
          setStorageReady(true)
        }
      })

    return () => {
      isActive = false
    }
  }, [loadUserData])

  const updateAuthField = (event) => {
    const { name, value } = event.target

    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const changeAuthMode = (mode) => {
    setAuthMode(mode)
    setAuthMessage('')
    setAuthForm((current) => ({
      ...current,
      password: '',
      confirmPassword: '',
    }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthMessage('')

    const isRegistering = authMode === 'register'
    const name = cleanText(authForm.name, 80)
    const email = normalizeEmail(authForm.email)
    const password = authForm.password

    if (!email || !email.includes('@')) {
      setAuthMessage('Digite um e-mail válido para continuar.')
      return
    }

    if (password.length < 4) {
      setAuthMessage('Use uma senha com pelo menos 4 caracteres.')
      return
    }

    if (isRegistering && !name) {
      setAuthMessage('Digite seu nome para criar a conta.')
      return
    }

    if (isRegistering && password !== authForm.confirmPassword) {
      setAuthMessage('As senhas não conferem.')
      return
    }

    setAuthBusy(true)

    try {
      const latestUsers = await readPersistentUsers()
      const passwordHash = await createPasswordHash(`${email}:${password}`)

      if (isRegistering) {
        const alreadyExists = latestUsers.some((user) => user.email === email)

        if (alreadyExists) {
          setAuthMessage('Já existe uma conta com esse e-mail.')
          return
        }

        const now = new Date().toISOString()
        const userData = createDefaultUserData()
        const nextUser = {
          id: createUserId(),
          name,
          email,
          passwordHash,
          createdAt: now,
          updatedAt: now,
          data: userData,
        }
        const nextUsers = [...latestUsers, nextUser]

        await writePersistentUsers(nextUsers)
        writeStorage(STORAGE_KEYS.session, nextUser.id)
        setAuth({ users: nextUsers, currentUserId: nextUser.id })
        setStorageReady(true)
        loadUserData(nextUser)
        setAuthForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        })
        setStatusMessage(`Conta criada. Olá, ${getFirstName(name)}!`)
        return
      }

      const foundUser = latestUsers.find((user) => user.email === email)

      if (!foundUser) {
        setAuthMessage('Conta não encontrada. Faça o cadastro primeiro.')
        return
      }

      if (foundUser.passwordHash !== passwordHash) {
        setAuthMessage('Senha incorreta. Tente novamente.')
        return
      }

      writeStorage(STORAGE_KEYS.session, foundUser.id)
      setAuth({ users: latestUsers, currentUserId: foundUser.id })
      setStorageReady(true)
      loadUserData(foundUser)
      setAuthForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setStatusMessage(`Olá, ${getFirstName(foundUser.name)}! Dados carregados.`)
    } catch {
      setAuthMessage('Não consegui acessar a conta agora. Tente novamente.')
    } finally {
      setAuthBusy(false)
    }
  }

  const handleLogout = () => {
    removeStorage(STORAGE_KEYS.session)
    setAuth({ users: readUsers(), currentUserId: null })
    setAuthMode('login')
    setAuthMessage('')
    setAuthForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
  }

  const saveCheckin = () => {
    const createdAt = new Date()
    const safeNote = cleanText(note)

    if (editingCheckinId) {
      const nextNote = safeNote || 'Check-in editado sem anotação.'

      setCheckins((current) =>
        current.map((entry) =>
          entry.id === editingCheckinId
            ? {
                ...entry,
                moodId: currentMood.id,
                moodLabel: currentMood.label,
                score: currentMood.score,
                stress: currentStress,
                note: nextNote,
              }
            : entry,
        ),
      )
      setSelectedHistoryId(editingCheckinId)
      setEditingCheckinId(null)
      setNote('')
      setStatusMessage('Check-in atualizado no histórico.')
      return
    }

    const nextCheckin = {
      id: Date.now(),
      day: getDayLabel(createdAt),
      moodId: currentMood.id,
      moodLabel: currentMood.label,
      score: currentMood.score,
      stress: currentStress,
      note: safeNote || 'Check-in rápido sem anotação.',
      createdAt: createdAt.toISOString(),
    }

    setCheckins((current) => [...current.slice(-20), nextCheckin])
    setNote('')
    setStatusMessage('Check-in salvo na sua conta.')
  }

  const startEditingCheckin = () => {
    if (!selectedHistoryEntry) {
      setStatusMessage('Selecione um check-in do histórico para editar.')
      return
    }

    setSelectedMood(selectedHistoryEntry.moodId)
    setNote(selectedHistoryEntry.note)
    setEditingCheckinId(selectedHistoryEntry.id)
    setSelectedHistoryId(selectedHistoryEntry.id)
    setStatusMessage('Edite o check-in no formulário principal.')
  }

  const selectHistoryCheckin = (entryId) => {
    setSelectedHistoryId(entryId)

    if (editingCheckinId && editingCheckinId !== entryId) {
      setEditingCheckinId(null)
      setNote('')
    }
  }

  const cancelEditingCheckin = () => {
    setEditingCheckinId(null)
    setNote('')
    setStatusMessage('Edição cancelada.')
  }

  const deleteSelectedCheckin = () => {
    if (!selectedHistoryEntry) {
      setStatusMessage('Selecione um check-in do histórico para excluir.')
      return
    }

    const deletedEntryId = selectedHistoryEntry.id
    setCheckins((current) =>
      current.filter((entry) => entry.id !== deletedEntryId),
    )
    setSelectedHistoryId(null)

    if (editingCheckinId === deletedEntryId) {
      setEditingCheckinId(null)
      setNote('')
    }

    setStatusMessage('Check-in excluído do histórico.')
  }

  const toggleHabit = (habitId) => {
    setCompletedHabits((current) =>
      current.includes(habitId)
        ? current.filter((item) => item !== habitId)
        : [...current, habitId],
    )
  }

  const publishPost = () => {
    const text = cleanText(anonymousDraft)

    if (!text) {
      setModerationMessage('Escreva uma mensagem curta antes de publicar.')
      return
    }

    const moderation = detectUnsafePost(text)

    if (moderation) {
      setModerationMessage(moderation.message)
      return
    }

    setCommunityPosts((current) => [
      {
        id: Date.now(),
        author: 'Anônimo',
        mood: currentMood.label,
        text,
      },
      ...current.slice(0, 7),
    ])
    setAnonymousDraft('')
    setModerationMessage('Mensagem publicada com segurança.')
  }

  const exportSummary = () => {
    try {
      const lines = [
        'MindUp - resumo emocional',
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        '',
        `Humor médio: ${moodAverage}%`,
        `Estresse médio: ${stressAverage}%`,
        `Autocuidado de hoje: ${habitProgress}%`,
        '',
        'Últimos check-ins:',
        ...checkins
          .slice(-7)
          .reverse()
          .map(
            (entry) =>
              `- ${formatDate(entry.createdAt)} | ${entry.moodLabel} | humor ${entry.score}% | estresse ${entry.stress}% | ${entry.note}`,
          ),
      ]
      const file = new Blob([lines.join('\n')], {
        type: 'text/plain;charset=utf-8',
      })
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')

      link.href = url
      link.download = 'mindup-resumo-emocional.txt'
      link.click()
      URL.revokeObjectURL(url)
      setStatusMessage('Resumo exportado.')
    } catch {
      setStatusMessage(fallbackMessage)
    }
  }

  const clearLocalData = () => {
    const shouldClear = window.confirm(
      'Apagar check-ins, hábitos e mensagens da sua conta local?',
    )

    if (!shouldClear) {
      return
    }

    const cleanData = createDefaultUserData()

    setPrivacyConsent(false)
    setCheckins(cleanData.checkins)
    setCompletedHabits(cleanData.habits)
    setCommunityPosts(cleanData.posts)
    setEditingCheckinId(null)
    setSelectedHistoryId(null)
    setNote('')
    setAnonymousDraft('')
    setStatusMessage('Dados da sua conta local apagados.')
  }

  const historyPanel = (
    <section className="history-panel inline-history" aria-labelledby="history-title">
      <div className="history-header">
        <div className="panel-title">
          <ClipboardList size={22} aria-hidden="true" />
          <div>
            <h3 id="history-title">Histórico recente</h3>
            <p>Últimos registros salvos no painel.</p>
          </div>
        </div>

        <div className="history-actions" aria-label="Ações do histórico">
          <button
            className="mini-button"
            type="button"
            onClick={startEditingCheckin}
            disabled={!selectedHistoryEntry}
          >
            Editar
          </button>
          <button
            className="mini-button danger-mini"
            type="button"
            onClick={deleteSelectedCheckin}
            disabled={!selectedHistoryEntry}
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="history-list">
        {recentCheckins.length ? (
          recentCheckins.map((entry) => (
            <button
              className="history-item"
              type="button"
              key={entry.id}
              aria-pressed={selectedHistoryEntry?.id === entry.id}
              onClick={() => selectHistoryCheckin(entry.id)}
            >
              <strong>{entry.moodLabel}</strong>
              <span>{formatDate(entry.createdAt)}</span>
              <p>{entry.note}</p>
            </button>
          ))
        ) : (
          <p className="empty-history">Nenhum check-in salvo ainda.</p>
        )}
      </div>
    </section>
  )

  if (!currentUser) {
    const isRegistering = authMode === 'register'

    return (
      <div className="app auth-shell">
        <main className="auth-main" id="login">
          <section className="auth-intro" aria-labelledby="auth-title">
            <div className="brand auth-brand" aria-label="MindUp">
              <span className="brand-mark">
                <Brain size={24} aria-hidden="true" />
              </span>
              <span>
                MindUp
                <small>Cuidar da mente também faz parte do futuro.</small>
              </span>
            </div>

            <p className="eyebrow">Conta local MindUp</p>
            <h1 id="auth-title">Entre para acessar seu painel emocional.</h1>
            <p className="lead">
              Cada cadastro mantém check-ins, hábitos e mensagens separados
              neste navegador.
            </p>

            <div className="auth-benefits" aria-label="Dados salvos na conta">
              <span>
                <HeartPulse size={18} aria-hidden="true" />
                Check-ins
              </span>
              <span>
                <CheckCircle2 size={18} aria-hidden="true" />
                Hábitos
              </span>
              <span>
                <LockKeyhole size={18} aria-hidden="true" />
                Dados locais
              </span>
            </div>
          </section>

          <section className="auth-card" aria-label="Login e cadastro">
            <div className="auth-tabs" aria-label="Escolha login ou cadastro">
              <button
                type="button"
                aria-pressed={authMode === 'login'}
                onClick={() => changeAuthMode('login')}
              >
                <LogIn size={18} aria-hidden="true" />
                Entrar
              </button>
              <button
                type="button"
                aria-pressed={authMode === 'register'}
                onClick={() => changeAuthMode('register')}
              >
                <UserPlus size={18} aria-hidden="true" />
                Cadastro
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {isRegistering ? (
                <label className="auth-field">
                  Nome
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={updateAuthField}
                    autoComplete="name"
                    placeholder="Seu nome"
                  />
                </label>
              ) : null}

              <label className="auth-field">
                E-mail
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={updateAuthField}
                  autoComplete="email"
                  placeholder="voce@email.com"
                />
              </label>

              <label className="auth-field">
                Senha
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={updateAuthField}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  placeholder="Mínimo 4 caracteres"
                />
              </label>

              {isRegistering ? (
                <label className="auth-field">
                  Confirmar senha
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={updateAuthField}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                  />
                </label>
              ) : null}

              <button
                className="control-button auth-submit"
                type="submit"
                disabled={authBusy}
              >
                {isRegistering ? (
                  <UserPlus size={18} aria-hidden="true" />
                ) : (
                  <LogIn size={18} aria-hidden="true" />
                )}
                {authBusy
                  ? 'Aguarde...'
                  : isRegistering
                    ? 'Criar conta'
                    : 'Entrar'}
              </button>
            </form>

            {authMessage ? (
              <p className="auth-message" role="alert">
                {authMessage}
              </p>
            ) : null}

            <p className="auth-note">
              <ShieldCheck size={17} aria-hidden="true" />
              Os dados ficam salvos apenas neste computador e navegador.
            </p>

            {canInstallApp ? (
              <button
                className="mini-button install-app-button"
                type="button"
                onClick={handleInstallApp}
              >
                <Download size={16} aria-hidden="true" />
                Instalar app
              </button>
            ) : null}
          </section>
        </main>

        {statusMessage ? (
          <div className="toast" role="status">
            <Info size={18} aria-hidden="true" />
            {statusMessage}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="app">
      <header className={`topbar ${hasScrolled ? 'is-scrolled' : ''}`}>
        <a className="brand" href="#inicio" aria-label="Início do MindUp">
          <span className="brand-mark">
            <Brain size={24} aria-hidden="true" />
          </span>
          <span>
            MindUp
            <small>Cuidar da mente também faz parte do futuro.</small>
          </span>
        </a>

        <div className="topbar-actions">
          <nav className="nav-links" aria-label="Seções do MindUp">
            <a href="#checkin">Check-in</a>
            <a href="#monitoramento">Monitoramento</a>
            <a href="#ia">IA</a>
            <a href="#pitch">Pitch</a>
            <a href="#emergencia">Emergência</a>
          </nav>

          <div className="account-area" aria-label="Conta logada">
            {canInstallApp ? (
              <button
                className="mini-button install-app-button"
                type="button"
                onClick={handleInstallApp}
              >
                <Download size={16} aria-hidden="true" />
                Instalar app
              </button>
            ) : null}
            <span className="account-pill">
              <Users size={16} aria-hidden="true" />
              {getFirstName(currentUser.name)}
            </span>
            <button className="logout-button" type="button" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="overview" id="inicio">
          <div className="overview-copy">
            <p className="eyebrow">Apoio emocional para jovens</p>
            <h1>Um painel simples para entender, respirar e pedir apoio.</h1>
            <p className="lead">
              O MindUp ajuda estudantes a registrar emoções, perceber padrões
              de estresse, criar hábitos saudáveis e encontrar acolhimento sem
              julgamento.
            </p>

            <div className="quick-actions" aria-label="Ações rápidas">
              <a className="primary-action" href="#checkin">
                <HeartPulse size={18} aria-hidden="true" />
                Fazer check-in
              </a>
              <a className="secondary-action" href="#respirar">
                <Wind size={18} aria-hidden="true" />
                Respirar agora
              </a>
              <a className="danger-action" href="#emergencia">
                <LifeBuoy size={18} aria-hidden="true" />
                Preciso de ajuda
              </a>
            </div>

            <dl className="impact-strip" aria-label="Resumo de impacto">
              <div>
                <dt>{moodAverage}%</dt>
                <dd>humor médio</dd>
              </div>
              <div>
                <dt>{stressAverage}%</dt>
                <dd>estresse médio</dd>
              </div>
              <div>
                <dt>{habitProgress}%</dt>
                <dd>autocuidado hoje</dd>
              </div>
            </dl>
          </div>

          <aside className="app-preview" aria-label="Resumo emocional atual">
            <div className="preview-header">
              <span>Hoje</span>
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <img
              className="preview-asset"
              src={heroImg}
              width="170"
              height="179"
              alt="Camadas visuais representando organização emocional"
            />
            <div className="preview-status">
              <span className="status-dot"></span>
              <p>{currentMood.summary}</p>
            </div>
            <div
              className="preview-meter"
              aria-label={`Indicador emocional em ${currentMood.score}%`}
            >
              <span style={{ width: `${currentMood.score}%` }}></span>
            </div>
            <div className="preview-actions">
              <button className="mini-button" type="button" onClick={exportSummary}>
                <Download size={16} aria-hidden="true" />
                Exportar resumo
              </button>
            </div>
          </aside>
        </section>

        <section className="workspace" aria-labelledby="workspace-title">
          <div className="section-heading">
            <p className="eyebrow">Rotina emocional</p>
            <h2 id="workspace-title">Ferramentas principais</h2>
          </div>

          <div className="tool-grid">
            <section className="tool-panel checkin-panel" id="checkin">
              <div className="panel-title">
                <HeartPulse size={22} aria-hidden="true" />
                <div>
                  <h3>Check-in emocional</h3>
                  <p>Registre como você está se sentindo hoje.</p>
                </div>
              </div>

              <div className="mood-grid" role="group" aria-label="Escolha de humor">
                {moods.map((mood) => {
                  const Icon = mood.icon

                  return (
                    <button
                      className="mood-button"
                      type="button"
                      key={mood.id}
                      style={{ '--mood-color': mood.color }}
                      aria-pressed={selectedMood === mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                    >
                      <Icon size={22} aria-hidden="true" />
                      <span>{mood.label}</span>
                    </button>
                  )
                })}
              </div>

              <label className="field-label" htmlFor="emotion-note">
                Algo importante sobre hoje
              </label>
              <textarea
                id="emotion-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={260}
                placeholder="Ex.: muita cobrança, prova chegando, medo do futuro..."
              />

              <button className="control-button" type="button" onClick={saveCheckin}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {editingCheckinId ? 'Atualizar check-in' : 'Salvar check-in'}
              </button>

              {editingCheckinId ? (
                <button
                  className="mini-button"
                  type="button"
                  onClick={cancelEditingCheckin}
                >
                  Cancelar edição
                </button>
              ) : null}

              {historyPanel}
            </section>

            <section className="tool-panel breathing-panel" id="respirar">
              <div className="panel-title">
                <Wind size={22} aria-hidden="true" />
                <div>
                  <h3>Exercícios rápidos</h3>
                  <p>Escolha uma pausa curta para reduzir a ansiedade.</p>
                </div>
              </div>

              <div className="exercise-tabs" role="tablist" aria-label="Exercícios">
                {exercises.map((exercise) => {
                  const Icon = exercise.icon

                  return (
                    <button
                      type="button"
                      key={exercise.id}
                      className="exercise-tab"
                      aria-selected={activeExercise === exercise.id}
                      onClick={() => setActiveExercise(exercise.id)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {exercise.title}
                    </button>
                  )
                })}
              </div>

              <div className={`breath-visual ${breathing ? 'is-active' : ''}`}>
                <span>{breathing ? 'Respire' : currentExercise.duration}</span>
              </div>

              <div className="exercise-copy">
                <h4>{currentExercise.title}</h4>
                <p>{currentExercise.text}</p>
              </div>

              <button
                className="control-button"
                type="button"
                onClick={() => setBreathing((value) => !value)}
              >
                {breathing ? (
                  <Pause size={18} aria-hidden="true" />
                ) : (
                  <Play size={18} aria-hidden="true" />
                )}
                {breathing ? 'Pausar exercício' : 'Iniciar exercício'}
              </button>
            </section>

            <section className="tool-panel monitor-panel" id="monitoramento">
              <div className="panel-title">
                <TrendingUp size={22} aria-hidden="true" />
                <div>
                  <h3>Monitoramento emocional</h3>
                  <p>Veja padrões simples de humor e estresse.</p>
                </div>
              </div>

              <div className="chart" aria-label="Gráfico semanal de humor e estresse">
                {chartData.map((item) => (
                  <div className="chart-day" key={item.id}>
                    <div className="chart-track">
                      <span
                        className="bar mood-bar"
                        style={{ height: `${item.score}%` }}
                        aria-label={`Humor em ${item.day}: ${item.score}%`}
                      ></span>
                      <span
                        className="bar stress-bar"
                        style={{ height: `${item.stress}%` }}
                        aria-label={`Estresse em ${item.day}: ${item.stress}%`}
                      ></span>
                    </div>
                    <strong>{item.day}</strong>
                  </div>
                ))}
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-mood"></i>
                  humor
                </span>
                <span>
                  <i className="legend-stress"></i>
                  estresse
                </span>
              </div>
            </section>
          </div>

        </section>

        <section className="ai-section" id="ia" aria-labelledby="ai-title">
          <div className="section-heading">
            <p className="eyebrow">IA de apoio</p>
            <h2 id="ai-title">Sugestões personalizadas para o seu momento</h2>
          </div>

          <div className="recommendation-grid">
            {supportTips.map((tip) => {
              const Icon = tip.icon

              return (
                <article className="recommendation-card" key={tip.title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="habits-section" aria-labelledby="habits-title">
          <div className="section-heading">
            <p className="eyebrow">Gamificação saudável</p>
            <h2 id="habits-title">Ranking pessoal de autocuidado</h2>
          </div>

          <div className="habit-row">
            {habits.map((habit) => {
              const Icon = habit.icon
              const done = completedHabits.includes(habit.id)

              return (
                <label className="habit-item" key={habit.id}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleHabit(habit.id)}
                  />
                  <span className="habit-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>{habit.label}</span>
                </label>
              )
            })}
          </div>
        </section>

        <section className="safe-section" id="espaco" aria-labelledby="safe-title">
          <div className="section-heading">
            <p className="eyebrow">Espaço seguro</p>
            <h2 id="safe-title">Desabafo anônimo e apoio entre jovens</h2>
          </div>

          <div className="safe-grid">
            <section className="safe-panel">
              <div className="panel-title">
                <LockKeyhole size={22} aria-hidden="true" />
                <div>
                  <h3>Mensagem anônima</h3>
                  <p>Compartilhe sem expor sua identidade.</p>
                </div>
              </div>

              <textarea
                value={anonymousDraft}
                onChange={(event) => setAnonymousDraft(event.target.value)}
                maxLength={260}
                placeholder="Escreva um desabafo, pedido de apoio ou pequena vitória..."
              />

              <button className="control-button" type="button" onClick={publishPost}>
                <Send size={18} aria-hidden="true" />
                Publicar anonimamente
              </button>

              {moderationMessage ? (
                <p className="moderation-message" role="status">
                  {moderationMessage}
                </p>
              ) : null}
            </section>

            <div className="post-list" aria-label="Mensagens anônimas">
              {communityPosts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div>
                    <MessageCircleHeart size={20} aria-hidden="true" />
                    <strong>{post.author}</strong>
                    <span>{post.mood}</span>
                  </div>
                  <p>{post.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="alert-section" id="alerta" aria-labelledby="alert-title">
          <div className={`alert-panel ${currentMood.score < 50 ? 'needs-care' : ''}`}>
            <Bell size={24} aria-hidden="true" />
            <div>
              <p className="eyebrow">Alerta emocional</p>
              <h2 id="alert-title">{alertStatus}</h2>
              <p>{alertText}</p>
            </div>
          </div>
        </section>

        <section
          className="emergency-section"
          id="emergencia"
          aria-labelledby="emergency-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Modo emergência emocional</p>
            <h2 id="emergency-title">Ajuda humana quando a situação passa do limite</h2>
          </div>

          <div className="emergency-grid">
            <article className="emergency-card urgent">
              <PhoneCall size={24} aria-hidden="true" />
              <h3>CVV 188</h3>
              <p>Atendimento gratuito, anônimo e 24 horas para apoio emocional.</p>
              <a href="tel:188" onClick={(event) => callPhoneNumber('188', event)}>
                <PhoneCall size={17} aria-hidden="true" />
                Ligar 188
              </a>
            </article>

            <article className="emergency-card">
              <ShieldAlert size={24} aria-hidden="true" />
              <h3>SAMU 192</h3>
              <p>Para risco imediato, emergência médica ou crise grave.</p>
              <a href="tel:192" onClick={(event) => callPhoneNumber('192', event)}>
                <PhoneCall size={17} aria-hidden="true" />
                Ligar 192
              </a>
            </article>

            <article className="emergency-card">
              <HeartHandshake size={24} aria-hidden="true" />
              <h3>Pessoa segura</h3>
              <p>Procure um responsável, professor, coordenação escolar ou amigo confiável.</p>
              <a href="#pitch">
                <School size={17} aria-hidden="true" />
                Ver plano escolar
              </a>
            </article>
          </div>
        </section>

        <section className="pitch-section" id="pitch" aria-labelledby="pitch-title">
          <div className="section-heading">
            <p className="eyebrow">Pitch do projeto</p>
            <h2 id="pitch-title">MindUp como proposta completa</h2>
          </div>

          <div className="pitch-grid">
            {pitchCards.map((card) => {
              const Icon = card.icon

              return (
                <article className="pitch-card" key={card.title}>
                  <Icon size={23} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              )
            })}
          </div>

          <div className="strategy-grid">
            <section className="strategy-panel">
              <div className="panel-title">
                <Trophy size={22} aria-hidden="true" />
                <div>
                  <h3>Objetivos específicos</h3>
                  <p>Metas que sustentam a proposta.</p>
                </div>
              </div>
              <ul className="objective-list">
                {objectives.map((objective) => (
                  <li key={objective}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {objective}
                  </li>
                ))}
              </ul>
            </section>

            <section className="strategy-panel">
              <div className="panel-title">
                <FileText size={22} aria-hidden="true" />
                <div>
                  <h3>Pitch curto</h3>
                  <p>Texto pronto para apresentar aos jurados.</p>
                </div>
              </div>
              <blockquote>
                A saúde mental dos jovens tem sido cada vez mais afetada pela
                pressão acadêmica, redes sociais e inseguranças do futuro. O
                MindUp surge como uma solução acessível e tecnológica que
                ajuda adolescentes a monitorarem emoções, criarem hábitos
                saudáveis e encontrarem apoio emocional de forma segura e
                acolhedora.
              </blockquote>
            </section>
          </div>

          <div className="school-flow">
            {schoolFlow.map((step) => {
              const Icon = step.icon

              return (
                <article key={step.title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="trust-section" aria-labelledby="trust-title">
          <div className="section-heading">
            <p className="eyebrow">Segurança e profissionalismo</p>
            <h2 id="trust-title">Privacidade, acessibilidade e limites responsáveis</h2>
          </div>

          <div className="trust-grid">
            <article className="trust-card">
              <Eye size={22} aria-hidden="true" />
              <h3>Acessibilidade</h3>
              <p>
                Interface responsiva, botões claros, contraste alto, rótulos de
                formulário e navegação por teclado.
              </p>
            </article>

            <article className="trust-card">
              <LockKeyhole size={22} aria-hidden="true" />
              <h3>Privacidade</h3>
              <p>
                Nesta versão, cada conta fica apenas neste navegador. Ao entrar,
                o usuário vê seus próprios check-ins, hábitos e mensagens.
              </p>
            </article>

            <article className="trust-card">
              <BookOpenCheck size={22} aria-hidden="true" />
              <h3>Limite da IA</h3>
              <p>
                A IA sugere hábitos e pausas, mas não diagnostica, não substitui
                atendimento psicológico e não atua em emergências.
              </p>
            </article>
          </div>

          <div className="data-actions">
            <a
              className="mini-button"
              href="https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} aria-hidden="true" />
              LGPD
            </a>
            <button className="mini-button" type="button" onClick={exportSummary}>
              <Download size={16} aria-hidden="true" />
              Exportar dados
            </button>
            <button className="mini-button danger-mini" type="button" onClick={clearLocalData}>
              <Trash2 size={16} aria-hidden="true" />
              Apagar meus dados
            </button>
          </div>
        </section>
      </main>

      {statusMessage ? (
        <div className="toast" role="status">
          <Info size={18} aria-hidden="true" />
          {statusMessage}
        </div>
      ) : null}

      {!privacyConsent ? (
        <section className="privacy-banner" aria-label="Aviso de privacidade">
          <div>
            <strong>Privacidade em primeiro lugar</strong>
            <p>
              Sua conta, check-ins, hábitos e mensagens ficam salvos apenas
              neste navegador. Você pode exportar ou apagar seus dados quando
              quiser.
            </p>
          </div>
          <button type="button" onClick={() => setPrivacyConsent(true)}>
            <ShieldCheck size={17} aria-hidden="true" />
            Entendi
          </button>
        </section>
      ) : null}

      <footer className="footer">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>
          MindUp é uma proposta preventiva e não substitui atendimento
          psicológico, médico ou serviço de emergência.
        </span>
        <a href="https://cvv.org.br/ligue-188-3/" target="_blank" rel="noreferrer">
          CVV 188
        </a>
        <a
          href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/samu-192"
          target="_blank"
          rel="noreferrer"
        >
          SAMU 192
        </a>
      </footer>
    </div>
  )
}

export default App
