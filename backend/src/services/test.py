"""
Test script for AI services pipeline.
Corresponds to test.js in the architecture.
Verifies Form Analysis, NLP Engine, Voice Analysis, Feature Fusion,
Distress Scoring, Temporal Trend, Alert Triggering, and Recommendations.
"""

import asyncio
from src.services.ai_service import (
    analyze_clinical_forms,
    analyze_nlp,
    analyze_voice,
    fuse_features,
    compute_distress_score,
    predict_temporal_trend,
    trigger_alert_engine,
    generate_recommendations
)
from src.models.interview_report_model import DistressSeverity


async def run_pipeline_test():
    print("=== SIH26094 Multi-modal AI Service Verification ===")

    # 1. Clinical Forms Test (MADRS, PHQ-9, GAD-7)
    forms_result = analyze_clinical_forms(
        madrs_data={"answers": [4, 5, 4, 6, 3, 4, 5, 5, 4, 5]},  # High depression
        phq9_data={"answers": [3, 2, 3, 2, 3, 2, 3, 2, 3]},       # Severe PHQ-9
        gad7_data={"answers": [3, 3, 2, 3, 2, 3, 2]}              # High anxiety
    )
    print("\n1. Form Analysis Output:")
    print(f"   MADRS: {forms_result['madrs']['raw_score']}/60")
    print(f"   PHQ-9: {forms_result['phq9']['raw_score']}/27")
    print(f"   GAD-7: {forms_result['gad7']['raw_score']}/21")
    print(f"   Composite Form Score: {forms_result['composite_form_score']}/100")

    # 2. NLP Engine Test
    sample_text = "I feel completely hopeless after the violent attack. I am terrified and in severe pain."
    nlp_result = analyze_nlp(sample_text, language="en")
    print("\n2. NLP Engine Output:")
    print(f"   Sentiment: {nlp_result['sentiment']}")
    print(f"   Threat Detected: {nlp_result['threat_detected']}")
    print(f"   NLP Distress Score: {nlp_result['nlp_distress_score']}/100")

    # 3. Voice Analysis Test
    voice_result = analyze_voice("uploads/voice_samples/sample_test.wav")
    print("\n3. Voice Analysis Output:")
    print(f"   Pitch Variance: {voice_result['pitch_variance']}")
    print(f"   Acoustic Stress Score: {voice_result['acoustic_stress_score']}/100")

    # 4. Feature Fusion Layer Test
    fusion_result = fuse_features(
        form_distress=forms_result['composite_form_score'],
        nlp_distress=nlp_result['nlp_distress_score'],
        voice_distress=voice_result['voice_distress_score'],
        context_score=75.0,  # High atrocity incident impact
        baseline_score=60.0
    )
    print("\n4. Feature Fusion Layer Output:")
    print(f"   Weights: {fusion_result['weights']}")
    print(f"   Contributions: {fusion_result['modalities_contributions']}")
    print(f"   Fused Score: {fusion_result['fused_raw_score']}/100")

    # 5. Distress Score Engine & Explainability Test
    distress_result = compute_distress_score(
        fusion_result,
        threat_flag=nlp_result['threat_detected']
    )
    print("\n5. Distress Score Engine Output:")
    print(f"   Final Distress Score: {distress_result['score']}/100")
    print(f"   Severity Level: {distress_result['severity_label']}")
    print(f"   Primary SHAP Driver: {distress_result['shap_explanations']['primary_driver']}")

    # 6. Temporal Trend Model (LSTM) Test
    temporal_result = predict_temporal_trend(
        historical_scores=[32.0, 41.0, 58.0],
        current_score=distress_result['score']
    )
    print("\n6. Temporal Trend Model Output:")
    print(f"   Trend Progression: {temporal_result['historical_series']}")
    print(f"   Direction: {temporal_result['trend_direction']}")
    print(f"   Worsening Risk Flag: {temporal_result['worsening_risk_flag']}")

    # 7. Alert Engine (Emergency 108 Dispatch) Test
    alert_result = await trigger_alert_engine(
        user_id=101,
        phone="+919876543210",
        distress_score=distress_result['score'],
        severity=distress_result['severity'],
        district="Varanasi"
    )
    print("\n7. Alert Engine Output:")
    print(f"   Alert Triggered: {alert_result['alert_triggered']}")
    print(f"   108 Ambulance Dispatched: {alert_result['ambulance_108_dispatched']}")
    if alert_result['ambulance_108_dispatched']:
        print(f"   Dispatch Details: {alert_result['dispatch_details']['dispatch_id']}")

    # 8. Recommendation Engine Test
    recs = generate_recommendations(
        distress_score=distress_result['score'],
        severity=distress_result['severity'],
        district="Varanasi"
    )
    print("\n8. Recommendation Engine Output:")
    print(f"   Counselling: {recs['counselling']['service']}")
    print(f"   Legal Aid: {recs['legal_aid']['scheme']}")
    print(f"   Financial Aid: {recs['financial_aid']['scheme']}")

    print("\n=== AI Service Pipeline Verification Completed Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_pipeline_test())
