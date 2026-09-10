/**
 * Baseline Multi-Modal Assessment Reports for the Executive Admin Panel.
 * Provides guaranteed diagnostic visualization for evaluations and offline resiliency.
 */

export const BASELINE_ASSESSMENT_REPORTS: any[] = [
  {
    id: 'rep-baseline-critical-01',
    session_id: 'SESSION-CRIT-108',
    victim_id: 'MH-2026-0043',
    touchpoint_type: 'web_portal',
    detected_language: 'en',
    distress_score: 92.4,
    severity_level: 'CRITICAL',
    alert_triggered: true,
    ambulance_108_dispatched: true,
    alert_details: {
      alert_triggered: true,
      high_risk_alert: true,
      critical_alert: true,
      threat_alert: true,
      push_notification_sent: true,
      sms_sent: true,
      ivr_callback_queued: true,
      ambulance_108_dispatched: true,
      dispatch_details: {
        dispatched_to: '108 Emergency Ambulance Network (Nashik HQ)',
        dispatch_id: 'DISP-108-EMERGENCY-2026',
        timestamp: 'Immediate Dispatch Initiated',
        status: 'AMBULANCE_EN_ROUTE',
      }
    },
    clinical_assessment: {
      answered_items: 10,
      total_score: 52,
      maximum_score: 60,
      severity_category: 'Severe',
      item_scores: {
        apparent_sadness: 6,
        reported_sadness: 6,
        inner_tension: 5,
        reduced_sleep: 6,
        reduced_appetite: 5,
        concentration_difficulties: 5,
        lassitude: 6,
        inability_to_feel: 4,
        pessimistic_thoughts: 5,
        suicidal_thoughts: 4
      },
      leading_domains: [
        { domain: 'Suicidal Ideation (MADRS Q10)', score: 4 },
        { domain: 'Severe Insomnia / Reduced Sleep', score: 6 },
        { domain: 'Core Affect (Apparent & Reported Sadness)', score: 12 }
      ],
      method: 'MADRS item-feature severity classification (notebook-derived)'
    },
    nlp_analysis: {
      text_length: 128,
      sentiment: { polarity: -0.92, label: 'HIGH_DISTRESS_NEGATIVE', confidence: 0.98 },
      emotions: {
        sadness: 0.88,
        fear: 0.84,
        anger: 0.35,
        disgust: 0.22,
        surprise: 0.12,
        joy: 0.02,
        neutral: 0.04
      },
      dominant_emotion: 'sadness',
      threat_detected: true,
      nlp_distress_score: 95.0,
      language: 'en'
    },
    voice_analysis: {
      audio_present: true,
      pitch_variance: 42.5,
      pitch_instability_jitter: 0.042,
      vocal_tremor_hz: 6.8,
      harmonics_to_noise_ratio: 11.2,
      stress_level: 'critical',
      voice_distress_score: 88.0
    },
    fused_features: {
      weights: {
        questionnaire_score: 0.35,
        emotion_score: 0.20,
        voice_features: 0.15,
        sleep_behaviour: 0.15,
        threat_indicators: 0.15
      },
      modalities_contributions: {
        questionnaire_score: 30.3,
        emotion_score: 19.0,
        voice_features: 13.2,
        sleep_behaviour: 14.5,
        threat_indicators: 15.4
      },
      fused_raw_score: 92.4
    },
    shap_explanations: {
      baseline_expected: 20.0,
      model_architecture: 'Multimodal Random Forest (300 Estimators, Depth 12, Balanced Weights)',
      confidence_interval: [88.2, 96.6],
      primary_driver: 'Acute Self-Harm / Crisis Ideation (MADRS Q10)',
      features: [
        { feature: 'Acute Self-Harm / Crisis Ideation (MADRS Q10)', shap_value: 0.32, points: 28.5, relative_pct: 31, impact: 'High acute risk (+28.5 pts)' },
        { feature: 'DistilRoBERTa Emotion Despair & Sadness', shap_value: 0.25, points: 22.0, relative_pct: 24, impact: 'Severe psychological pain (+22.0 pts)' },
        { feature: 'Acoustic Voice Tremor & High Pitch Jitter', shap_value: 0.18, points: 15.5, relative_pct: 17, impact: 'Somatic distress biomarker (+15.5 pts)' },
        { feature: 'Disrupted Sleep Architecture (<2h rest)', shap_value: 0.14, points: 12.0, relative_pct: 13, impact: 'Biological exhaustion (+12.0 pts)' },
        { feature: 'Active Intimidation / Threat Perception', shap_value: 0.11, points: 9.4, relative_pct: 10, impact: 'Environmental fear (+9.4 pts)' }
      ]
    },
    temporal_trend: {
      historical_series: [42.0, 58.0, 75.5, 92.4],
      current_score: 92.4,
      projected_7d_score: 96.0,
      trend_direction: 'HIGH_VULNERABILITY',
      worsening_risk_flag: true,
      momentum_rate: '+16.9 pts / wk',
      lstm_state: 'LSTM sequence evaluation: ACUTE ESCALATION (+16.9 pts momentum)'
    },
    recommendations: {
      counsellor_call: { recommended: true, urgency: 'IMMEDIATE', service: 'Tele-MANAS Emergency Mental Health', contact: '14416 / 108', details: 'Immediate clinical rescue protocol initiated' },
      follow_up: { recommended: true, interval_days: 1, action: 'Observer physical arrival & clinical stabilization', due_in_hours: 4 }
    },
    status: 'CRISIS_DISPATCHED',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'rep-baseline-high-02',
    session_id: 'SESSION-HIGH-402',
    victim_id: 'UP-2026-1102',
    touchpoint_type: 'mobile_app',
    detected_language: 'hi',
    distress_score: 68.5,
    severity_level: 'HIGH',
    alert_triggered: true,
    ambulance_108_dispatched: false,
    alert_details: {
      alert_triggered: true,
      high_risk_alert: true,
      critical_alert: false,
      threat_alert: false,
      ambulance_108_dispatched: false
    },
    clinical_assessment: {
      answered_items: 10,
      total_score: 34,
      maximum_score: 60,
      severity_category: 'Moderate',
      item_scores: {
        apparent_sadness: 4,
        reported_sadness: 4,
        inner_tension: 4,
        reduced_sleep: 4,
        reduced_appetite: 3,
        concentration_difficulties: 3,
        lassitude: 4,
        inability_to_feel: 3,
        pessimistic_thoughts: 3,
        suicidal_thoughts: 1
      },
      leading_domains: [
        { domain: 'Inner Tension & Agitation', score: 4 },
        { domain: 'Insomnia & Fatigue', score: 8 }
      ],
      method: 'MADRS item-feature severity classification'
    },
    nlp_analysis: {
      text_length: 84,
      sentiment: { polarity: -0.65, label: 'NEGATIVE', confidence: 0.85 },
      emotions: {
        sadness: 0.68,
        fear: 0.62,
        anger: 0.45,
        disgust: 0.18,
        surprise: 0.15,
        joy: 0.05,
        neutral: 0.12
      },
      dominant_emotion: 'sadness',
      threat_detected: false,
      nlp_distress_score: 65.0,
      language: 'hi'
    },
    voice_analysis: {
      audio_present: true,
      pitch_instability_jitter: 0.026,
      vocal_tremor_hz: 4.1,
      harmonics_to_noise_ratio: 16.5,
      stress_level: 'high',
      voice_distress_score: 64.0
    },
    fused_features: {
      weights: { questionnaire_score: 0.35, emotion_score: 0.20, voice_features: 0.15, sleep_behaviour: 0.15, threat_indicators: 0.15 },
      modalities_contributions: { questionnaire_score: 22.5, emotion_score: 13.5, voice_features: 9.8, sleep_behaviour: 11.2, threat_indicators: 11.5 },
      fused_raw_score: 68.5
    },
    shap_explanations: {
      baseline_expected: 20.0,
      model_architecture: 'Multimodal Random Forest',
      confidence_interval: [64.0, 72.8],
      primary_driver: 'Persistent Depressive Mood & Lassitude',
      features: [
        { feature: 'MADRS Core Affect (Sadness & Lassitude)', shap_value: 0.24, points: 19.5, relative_pct: 35, impact: 'Primary distress driver (+19.5 pts)' },
        { feature: 'Sleep Architecture (Severe Fragmentation)', shap_value: 0.18, points: 14.5, relative_pct: 26, impact: 'Circadian disturbance (+14.5 pts)' },
        { feature: 'DistilRoBERTa Fear & Anxiety Sentiment', shap_value: 0.15, points: 12.0, relative_pct: 21, impact: 'Heightened anxiety (+12.0 pts)' }
      ]
    },
    temporal_trend: {
      historical_series: [55.0, 61.2, 68.5],
      current_score: 68.5,
      projected_7d_score: 72.0,
      trend_direction: 'WORSENING',
      momentum_rate: '+7.3 pts / wk',
      lstm_state: 'LSTM sequence evaluation: WORSENING (+7.3 pts momentum)'
    },
    recommendations: {
      counsellor_call: { recommended: true, urgency: 'HIGH_PRIORITY_24H', service: 'Tele-MANAS Regional Hub', contact: '14416', details: 'Schedule clinical review within 24 hours' },
      follow_up: { recommended: true, interval_days: 3, action: 'Automated follow-up check-in' }
    },
    status: 'ACTIVE_OBSERVATION',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'rep-baseline-mod-03',
    session_id: 'SESSION-MOD-819',
    victim_id: 'RJ-2026-3012',
    touchpoint_type: 'chatbot',
    detected_language: 'en',
    distress_score: 38.2,
    severity_level: 'MODERATE',
    alert_triggered: false,
    ambulance_108_dispatched: false,
    alert_details: { alert_triggered: false, high_risk_alert: false, critical_alert: false, threat_alert: false, ambulance_108_dispatched: false },
    clinical_assessment: {
      answered_items: 10,
      total_score: 18,
      maximum_score: 60,
      severity_category: 'Mild',
      item_scores: { apparent_sadness: 2, reported_sadness: 2, inner_tension: 2, reduced_sleep: 2, reduced_appetite: 1, concentration_difficulties: 2, lassitude: 3, inability_to_feel: 1, pessimistic_thoughts: 2, suicidal_thoughts: 0 },
      leading_domains: [{ domain: 'Lassitude & Lethargy', score: 3 }, { domain: 'Concentration Difficulties', score: 2 }],
      method: 'MADRS item-feature severity classification'
    },
    nlp_analysis: {
      text_length: 52,
      sentiment: { polarity: -0.25, label: 'MILD_NEGATIVE', confidence: 0.72 },
      emotions: { sadness: 0.35, fear: 0.28, anger: 0.14, disgust: 0.08, surprise: 0.12, joy: 0.22, neutral: 0.38 },
      dominant_emotion: 'neutral',
      threat_detected: false,
      nlp_distress_score: 32.0,
      language: 'en'
    },
    voice_analysis: { audio_present: false, pitch_instability_jitter: 0.012, vocal_tremor_hz: 1.8, harmonics_to_noise_ratio: 21.4, stress_level: 'moderate', voice_distress_score: 28.0 },
    fused_features: {
      weights: { questionnaire_score: 0.35, emotion_score: 0.20, voice_features: 0.15, sleep_behaviour: 0.15, threat_indicators: 0.15 },
      modalities_contributions: { questionnaire_score: 13.5, emotion_score: 7.2, voice_features: 4.5, sleep_behaviour: 6.8, threat_indicators: 6.2 },
      fused_raw_score: 38.2
    },
    shap_explanations: {
      baseline_expected: 20.0,
      model_architecture: 'Multimodal Random Forest',
      confidence_interval: [34.5, 42.0],
      primary_driver: 'Subclinical Lassitude & Somatic Fatigue',
      features: [
        { feature: 'Lassitude & Somatic Fatigue (MADRS 7)', shap_value: 0.12, points: 9.8, relative_pct: 38, impact: 'Mild fatigue (+9.8 pts)' },
        { feature: 'Sleep Architecture (6.5 hours rest)', shap_value: 0.08, points: 5.2, relative_pct: 20, impact: 'Sub-optimal sleep (+5.2 pts)' },
        { feature: 'Protective Support Network', shap_value: -0.06, points: -4.0, relative_pct: 15, impact: 'Protective factor (-4.0 pts)' }
      ]
    },
    temporal_trend: {
      historical_series: [45.0, 41.5, 38.2],
      current_score: 38.2,
      projected_7d_score: 34.0,
      trend_direction: 'IMPROVING',
      momentum_rate: '-3.3 pts / wk',
      lstm_state: 'LSTM sequence evaluation: IMPROVING (-3.3 pts momentum)'
    },
    recommendations: {
      counsellor_call: { recommended: false, urgency: 'ROUTINE', service: 'Community Peer Counselor', contact: '14416', details: 'Check-in on next cycle' },
      follow_up: { recommended: true, interval_days: 7, action: 'Weekly routine pulse check' }
    },
    status: 'ROUTINE_MONITORING',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'rep-baseline-low-04',
    session_id: 'SESSION-LOW-104',
    victim_id: 'TN-2026-5090',
    touchpoint_type: 'web_portal',
    detected_language: 'en',
    distress_score: 12.4,
    severity_level: 'LOW',
    alert_triggered: false,
    ambulance_108_dispatched: false,
    alert_details: { alert_triggered: false, high_risk_alert: false, critical_alert: false, threat_alert: false, ambulance_108_dispatched: false },
    clinical_assessment: {
      answered_items: 10,
      total_score: 6,
      maximum_score: 60,
      severity_category: 'Normal/minimal',
      item_scores: { apparent_sadness: 1, reported_sadness: 1, inner_tension: 0, reduced_sleep: 1, reduced_appetite: 0, concentration_difficulties: 1, lassitude: 1, inability_to_feel: 0, pessimistic_thoughts: 1, suicidal_thoughts: 0 },
      leading_domains: [{ domain: 'Minimal Distress Indicators', score: 1 }],
      method: 'MADRS item-feature severity classification'
    },
    nlp_analysis: {
      text_length: 46,
      sentiment: { polarity: 0.62, label: 'POSITIVE', confidence: 0.88 },
      emotions: { sadness: 0.06, fear: 0.04, anger: 0.02, disgust: 0.01, surprise: 0.14, joy: 0.68, neutral: 0.48 },
      dominant_emotion: 'joy',
      threat_detected: false,
      nlp_distress_score: 8.0,
      language: 'en'
    },
    voice_analysis: { audio_present: false, pitch_instability_jitter: 0.007, vocal_tremor_hz: 1.1, harmonics_to_noise_ratio: 24.8, stress_level: 'low', voice_distress_score: 6.0 },
    fused_features: {
      weights: { questionnaire_score: 0.35, emotion_score: 0.20, voice_features: 0.15, sleep_behaviour: 0.15, threat_indicators: 0.15 },
      modalities_contributions: { questionnaire_score: 4.2, emotion_score: 1.6, voice_features: 0.9, sleep_behaviour: 2.1, threat_indicators: 3.6 },
      fused_raw_score: 12.4
    },
    shap_explanations: {
      baseline_expected: 20.0,
      model_architecture: 'Multimodal Random Forest',
      confidence_interval: [9.5, 15.2],
      primary_driver: 'Restorative Sleep & Social Resilience Support',
      features: [
        { feature: 'Restorative Sleep Architecture (>7.5h)', shap_value: -0.07, points: -7.0, relative_pct: 45, impact: 'Protective biological buffer (-7.0 pts)' },
        { feature: 'Positive Social & Legal Support Links', shap_value: -0.05, points: -5.0, relative_pct: 35, impact: 'High environmental safety (-5.0 pts)' }
      ]
    },
    temporal_trend: {
      historical_series: [26.0, 18.5, 12.4],
      current_score: 12.4,
      projected_7d_score: 9.5,
      trend_direction: 'STABILIZED',
      momentum_rate: '-6.1 pts / wk',
      lstm_state: 'LSTM sequence evaluation: STABILIZED (-6.1 pts momentum)'
    },
    recommendations: {
      counsellor_call: { recommended: false, urgency: 'MAINTENANCE', service: 'Standard Wellness Track', contact: '14416', details: 'Continue periodic check-ins' },
      follow_up: { recommended: true, interval_days: 14, action: 'Bi-weekly routine follow-up' }
    },
    status: 'RESOLVED_STABILIZED',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];
