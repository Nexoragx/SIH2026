```
                        ┌───────────────────────┐
                        │       VICTIM USER     │
                        │  Mobile / Web / IVR   │
                        └───────────┬───────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │      DATA COLLECTION        │
                     │                             │
                     │ • Questionnaire             │
                     │ • Text responses            │
                     │ • Voice responses           │
                     │ • Sleep / mood inputs       │
                     │ • Threat / safety reports   │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │      BACKEND API LAYER      │
                     │      FastAPI / Node.js      │
                     │                             │
                     │ • Authentication            │
                     │ • User / case management    │
                     │ • Check-in management       │
                     │ • Data validation           │
                     └──────────────┬──────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐
        │ TEXT ANALYSIS  │ │ VOICE ANALYSIS │ │ FORM ANALYSIS   │
        │                │ │                │ │                 │
        │ NLP Model      │ │ Speech-to-text │ │ Questionnaire   │
        │ Emotion        │ │ Tone/features  │ │ Score           │
        │ Sentiment      │ │ Stress signals │ │ Sleep score     │
        │ Threat detect  │ │                │ │ Safety inputs   │
        └────────┬───────┘ └────────┬───────┘ └────────┬────────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │      FEATURE FUSION         │
                     │                             │
                     │ Combine:                    │
                     │ • Emotion score             │
                     │ • Questionnaire score       │
                     │ • Voice features            │
                     │ • Sleep / behaviour         │
                     │ • Threat indicators         │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │    DISTRESS SCORE ENGINE    │
                     │                             │
                     │        Score: 0–100         │
                     │                             │
                     │ Low / Medium / High /       │
                     │ Critical                    │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │    TEMPORAL / TREND MODEL   │
                     │                             │
                     │ Compare previous check-ins  │
                     │                             │
                     │ 32 → 41 → 53 → 71           │
                     │                             │
                     │ Predict worsening risk      │
                     └──────────────┬──────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
              ┌──────────────────┐   ┌─────────────────────┐
              │ ALERT ENGINE     │   │ RECOMMENDATION      │
              │                  │   │ ENGINE              │
              │ High risk alert  │   │                     │
              │ Critical alert   │   │ Counsellor call     │
              │ Threat alert     │   │ Follow-up           │
              └────────┬─────────┘   │ Safety review       │
                       │             └──────────┬──────────┘
                       └──────────────┬─────────┘
                                      ▼
                        ┌─────────────────────────┐
                        │ COUNSELLOR / OFFICER    │
                        │       DASHBOARD         │
                        │                         │
                        │ • Risk cases            │
                        │ • Distress graph        │
                        │ • Alerts                │
                        │ • Case history          │
                        │ • Recommendations       │
                        └─────────────────────────┘
```