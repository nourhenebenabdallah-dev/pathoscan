import { useState, useCallback, useRef } from 'react'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

// ── Récupère toutes les données de l'app ──────────────────────────────────────
async function fetchAppContext() {
  const token = localStorage.getItem('doctor_token')
  if (!token) return null

  const headers = { Authorization: `Bearer ${token}` }
  const base    = 'http://localhost:8000'

  try {
    const [statsRes, patientsRes, imgRes, riskRes, mammoRes, doctorRes] = await Promise.allSettled([
      fetch(`${base}/api/stats`,                     { headers }),
      fetch(`${base}/api/patients?limit=200`,         { headers }),
      fetch(`${base}/api/predictions/image?limit=10`, { headers }),
      fetch(`${base}/api/predictions/risk?limit=10`,  { headers }),
      fetch(`${base}/api/predictions/mammo?limit=10`, { headers }),
      fetch(`${base}/doctor/me`,                      { headers }),
    ])

    const ok  = (r) => r.status === 'fulfilled' && r.value.ok
    const json = async (r) => ok(r) ? r.value.json() : null

    const [stats, patients, imgPreds, riskPreds, mammoPreds, doctor] = await Promise.all([
      json(statsRes), json(patientsRes), json(imgRes),
      json(riskRes),  json(mammoRes),    json(doctorRes),
    ])

    const img   = stats?.histopathology || {}
    const risk  = stats?.risk           || {}
    const mammo = stats?.mammography    || {}

    // ── Patients enrichis ──────────────────────────────────────────────────
    const patientList = (patients?.patients || []).map(p => ({
      id:             p.patient_id,
      nom:            p.name,
      age:            p.age,
      sexe:           p.gender,
      email:          p.email || '—',
      total_analyses: (p.total_analyses || 0) + (p.total_risk_analyses || 0) + (p.total_mammo_analyses || 0),
      idc:            p.total_analyses       || 0,
      risque:         p.total_risk_analyses  || 0,
      mammo:          p.total_mammo_analyses || 0,
      date_ajout:     p.created_at?.slice(0, 10) || '—',
      derniere_maj:   p.updated_at?.slice(0, 10) || '—',
    }))

    // ── Dernières analyses détaillées ──────────────────────────────────────
    const fmtImg   = (p) => ({ patient: p.patient_id || 'N/A', verdict: p.verdict, prob: Math.round((p.probability||0)*100)+'%', confiance: p.confidence, mode: p.mode, fichier: p.filename, date: p.created_at?.slice(0,10) })
    const fmtRisk  = (p) => ({ patient: p.patient_id || 'N/A', verdict: p.verdict, prob: Math.round((p.probability||0)*100)+'%', confiance: p.confidence_label, age: p.input_data?.Age, stade_T: p.input_data?.T_Stage, stade_N: p.input_data?.N_Stage, taille_tumeur: p.input_data?.Tumor_Size, date: p.created_at?.slice(0,10) })
    const fmtMammo = (p) => ({ patient: p.patient_id || 'N/A', verdict: p.verdict, prob: Math.round((p.probability||0)*100)+'%', confiance: p.confidence, cote: p.breast_side, vue: p.view, date: p.created_at?.slice(0,10) })

    // ── Calculs dérivés dashboard ──────────────────────────────────────────
    const totalAnalyses  = (img.total || 0) + (risk.total || 0) + (mammo.total || 0)
    const alertesCritiques = (img.malins || 0) + (risk.high_risk || 0) + (mammo.masses || 0)

    // Confiance IDC
    const confIDC = {
      haute:   img.confidence_stats?.Haute    || 0,
      moderee: img.confidence_stats?.Modérée  || img.confidence_stats?.Moderee || 0,
      faible:  img.confidence_stats?.Faible   || 0,
    }
    const confRisk = {
      haute:   risk.confidence_stats?.Haute   || 0,
      moderee: risk.confidence_stats?.Modérée || risk.confidence_stats?.Moderee || 0,
      faible:  risk.confidence_stats?.Faible  || 0,
    }
    const confMammo = {
      haute:   mammo.confidence_stats?.HAUTE   || 0,
      moyenne: mammo.confidence_stats?.MOYENNE || 0,
      faible:  mammo.confidence_stats?.FAIBLE  || 0,
    }

    // Vues mammographie
    const mammoCC  = mammo.by_view?.CC  || 0
    const mammoMLO = mammo.by_view?.MLO || 0

    // ── Heure pour le greeting ─────────────────────────────────────────────
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

    return {
      doctor: {
        nom:        doctor?.name       || '—',
        email:      doctor?.email      || '—',
        specialite: doctor?.specialty  || '—',
        hopital:    doctor?.hospital   || '—',
        ville:      doctor?.city       || '—',
        experience: doctor?.years_experience || 0,
        statut:     doctor?.status     || '—',
      },
      greeting,
      dashboard: {
        total_patients:   stats?.total_patients   || 0,
        total_analyses:   totalAnalyses,
        alertes_critiques: alertesCritiques,
        histopathologie: {
          total:           img.total            || 0,
          malins:          img.malins           || 0,
          benins:          img.benins           || 0,
          taux_malignite:  img.taux_malignite   || 0,
          recent_7j:       img.recent_7j        || 0,
          confiance:       confIDC,
        },
        risque: {
          total:           risk.total           || 0,
          high_risk:       risk.high_risk       || 0,
          low_risk:        risk.low_risk        || 0,
          taux_high_risk:  risk.taux_high_risk  || 0,
          recent_7j:       risk.recent_7j       || 0,
          confiance:       confRisk,
        },
        mammographie: {
          total:           mammo.total          || 0,
          masses:          mammo.masses         || 0,
          normaux:         mammo.normaux        || 0,
          taux_detection:  mammo.taux_detection || 0,
          recent_7j:       mammo.recent_7j      || 0,
          confiance:       confMammo,
          vues:            { CC: mammoCC, MLO: mammoMLO },
        },
      },
      patients: {
        total: patients?.total || 0,
        liste: patientList,
      },
      analyses: {
        idc:   (imgPreds?.predictions   || []).map(fmtImg),
        risque:(riskPreds?.predictions  || []).map(fmtRisk),
        mammo: (mammoPreds?.predictions || []).map(fmtMammo),
      },
    }
  } catch (e) {
    console.warn('[PathoBot] Contexte non chargé:', e)
    return null
  }
}

// ── Prompt système avec données dashboard ─────────────────────────────────────
function buildSystemPrompt(ctx) {
  const base = `Tu es PathoBot, assistant IA de PathoScan (diagnostic cancer du sein).

STYLE — OBLIGATOIRE :
- Français, COURT et DIRECT : 2-4 phrases max (sauf si on demande un rapport détaillé)
- Chiffres concrets tirés des données réelles
- Zéro introduction inutile, zéro répétition
- Listes : 4 éléments max avec tirets
- Question simple = 1-2 phrases suffisent

SEUILS DE DÉCISION :
- IDC > 0.56 → Malin | < 0.56 → Bénin
- SEER > 0.50 → High Risk | < 0.50 → Low Risk  
- Mammo > 0.50 → MASSE | < 0.50 → NORMAL

NAVIGATION APP :
- /dashboard → tableau de bord (statistiques globales, graphiques)
- /analyze → analyse histopathologique IDC (upload image patch 50×50)
- /mammographie → analyse mammographie (GradCAM++ heatmap)
- /prediction_risque → score risque SEER (14 paramètres cliniques)
- /patients → liste et gestion des patients
- /history → historique de toutes les analyses
- /profile → profil du médecin

GRAPHIQUES DU DASHBOARD :
- 4 cartes : Total patients | Histopathologie | Risque SEER | Mammographies
- Camemberts : répartition Malin/Bénin, High/Low Risk, Masse/Normal
- Courbe : tendance hebdomadaire sur 7 jours (IDC, Risque, Mammo)
- Barres : volume par modalité

Rappelle que l'IA ne remplace pas le jugement clinique pour les cas graves.`

  if (!ctx) return base

  const d   = ctx.dashboard
  const img  = d.histopathologie
  const risk = d.risque
  const mammo= d.mammographie

  // Top patients par nombre d'analyses
  const topPatients = [...ctx.patients.liste]
    .sort((a, b) => b.total_analyses - a.total_analyses)
    .slice(0, 5)

  // Patients avec des analyses récentes
  const recentsPatients = ctx.patients.liste
    .filter(p => p.total_analyses > 0)
    .slice(0, 8)

  const data = `

=== TABLEAU DE BORD EN TEMPS RÉEL ===
Médecin : Dr. ${ctx.doctor.nom} | ${ctx.doctor.specialite} | ${ctx.doctor.hopital}

--- Cartes principales ---
• Patients enregistrés : ${d.total_patients}
• Total analyses toutes modalités : ${d.total_analyses}
• Alertes critiques (malins + haut risque + masses) : ${d.alertes_critiques}

--- Histopathologie IDC (${img.total} analyses) ---
• Malins : ${img.malins} (${img.taux_malignite}%)
• Bénins : ${img.benins}
• Cette semaine : ${img.recent_7j}
• Confiance haute/modérée/faible : ${img.confiance.haute}/${img.confiance.moderee}/${img.confiance.faible}

--- Risque Clinique SEER (${risk.total} analyses) ---
• Haut risque : ${risk.high_risk} (${risk.taux_high_risk}%)
• Bas risque : ${risk.low_risk}
• Cette semaine : ${risk.recent_7j}
• Confiance haute/modérée/faible : ${risk.confiance.haute}/${risk.confiance.moderee}/${risk.confiance.faible}

--- Mammographie (${mammo.total} analyses) ---
• Masses détectées : ${mammo.masses} (${mammo.taux_detection}%)
• Normaux : ${mammo.normaux}
• Cette semaine : ${mammo.recent_7j}
• Vues CC/MLO : ${mammo.vues.CC}/${mammo.vues.MLO}
• Confiance haute/moyenne/faible : ${mammo.confiance.haute}/${mammo.confiance.moyenne}/${mammo.confiance.faible}

=== PATIENTS (${ctx.patients.total} au total) ===
${ctx.patients.liste.length === 0 ? 'Aucun patient enregistré.' :
  ctx.patients.liste.map(p =>
    `• ${p.nom} (ID:${p.id}) | ${p.age}ans | ${p.sexe} | ${p.total_analyses} analyse(s) [IDC:${p.idc} SEER:${p.risque} Mammo:${p.mammo}] | ajouté ${p.date_ajout}`
  ).join('\n')
}

=== TOP 5 PATIENTS LES PLUS ANALYSÉS ===
${topPatients.map((p, i) => `${i+1}. ${p.nom} — ${p.total_analyses} analyses`).join('\n') || 'Aucun'}

=== DERNIÈRES ANALYSES IDC ===
${ctx.analyses.idc.length === 0 ? 'Aucune.' :
  ctx.analyses.idc.map(a =>
    `• Patient ${a.patient} → ${a.verdict} (${a.prob}) confiance:${a.confiance} mode:${a.mode} — ${a.date}`
  ).join('\n')
}

=== DERNIÈRES ANALYSES RISQUE SEER ===
${ctx.analyses.risque.length === 0 ? 'Aucune.' :
  ctx.analyses.risque.map(a =>
    `• Patient ${a.patient} → ${a.verdict} (${a.prob}) confiance:${a.confiance} | Age:${a.age} T:${a.stade_T} N:${a.stade_N} tumeur:${a.taille_tumeur}mm — ${a.date}`
  ).join('\n')
}

=== DERNIÈRES MAMMOGRAPHIES ===
${ctx.analyses.mammo.length === 0 ? 'Aucune.' :
  ctx.analyses.mammo.map(a =>
    `• Patient ${a.patient} → ${a.verdict} (${a.prob}) confiance:${a.confiance} | ${a.cote} ${a.vue} — ${a.date}`
  ).join('\n')
}`

  return base + data
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function useGroqChat(apiKey) {
  const [messages,  setMessages]  = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const abortRef      = useRef(null)
  const contextRef    = useRef(null)
  const contextAgeRef = useRef(0)

  const getContext = useCallback(async () => {
    const now = Date.now()
    if (contextRef.current && now - contextAgeRef.current < 60_000) return contextRef.current
    const ctx = await fetchAppContext()
    contextRef.current    = ctx
    contextAgeRef.current = now
    return ctx
  }, [])

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return

    const userMsg = { role: 'user', content: userText.trim(), id: Date.now() }
    const next    = [...messages, userMsg]
    setMessages(next)
    setIsLoading(true)
    setError(null)

    const assistantId = Date.now() + 1
    setMessages([...next, { role: 'assistant', content: '', id: assistantId, streaming: true }])
    abortRef.current = new AbortController()

    try {
      const context      = await getContext()
      const systemPrompt = buildSystemPrompt(context)

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          max_tokens:  450,
          temperature: 0.35,
          stream:      true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...next.map(({ role, content }) => ({ role, content })),
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Erreur API Groq (${res.status})`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          const t = line.trim()
          if (!t || t === 'data: [DONE]' || !t.startsWith('data: ')) continue
          try {
            const delta = JSON.parse(t.slice(6)).choices?.[0]?.delta?.content || ''
            full += delta
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m))
          } catch { /* ignore */ }
        }
      }

      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full, streaming: false } : m))
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Erreur de connexion')
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, apiKey, getContext])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m))
  }, [])

  const refreshContext = useCallback(() => {
    contextRef.current    = null
    contextAgeRef.current = 0
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages, stopStreaming, refreshContext }
}