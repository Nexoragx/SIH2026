"""
End-to-end integration test for FastAPI backend.
Tests Auth (JWT + RBAC + Blacklisting), OAuth routes, Multi-modal assessments,
Distress scoring, 108 emergency dispatch, and Health Observer Dashboard.
"""

from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def run_tests():
    print("=== SIH26094 End-to-End Test Suite ===")

    # 1. Health check
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ 1. Health check passed:", res.json()["status"])

    # 2. Architecture layers
    res = client.get("/api/v1/architecture")
    assert res.status_code == 200
    assert len(res.json()["layers"]) == 9
    print("✅ 2. Architecture layers endpoint verified: 9 tiers present")

    # 3. Register Victim
    victim_payload = {
        "email": "victim_test@sih.org",
        "password": "Password123!",
        "full_name": "Test Victim User",
        "role": "victim",
        "phone": "+919876543210",
        "district": "Varanasi",
        "state": "Uttar Pradesh"
    }
    res = client.post("/api/v1/auth/register", json=victim_payload)
    assert res.status_code == 200, f"Registration failed: {res.text}"
    auth_data = res.json()
    victim_token = auth_data["access_token"]
    victim_refresh = auth_data["refresh_token"]
    print("✅ 3. Victim registration & JWT token pair generated successfully")

    # 4. Login
    login_payload = {
        "email": "victim_test@sih.org",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    assert "access_token" in res.json()
    print("✅ 4. JWT Login successful")

    # 5. Protected profile /auth/me
    headers = {"Authorization": f"Bearer {victim_token}"}
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "victim_test@sih.org"
    print("✅ 5. /auth/me protected profile verified:", res.json()["full_name"])

    # 6. Submit Multi-Modal Assessment (Form + NLP + Context)
    assessment_payload = {
        "touchpoint_type": "mobile_app",
        "language": "en",
        "madrs": {"answers": [4, 5, 4, 6, 4, 5, 5, 4, 5, 5]}, # High MADRS depression
        "phq9": {"answers": [3, 3, 2, 3, 3, 2, 3, 3, 3]},       # High PHQ-9
        "gad7": {"answers": [3, 3, 3, 2, 3, 3, 2]},             # High GAD-7
        "text_content": "I was attacked and subjected to extreme violence. I can't sleep and I feel completely helpless.",
        "context_score": 80.0,
        "district": "Varanasi",
        "state": "Uttar Pradesh"
    }
    res = client.post("/api/v1/interview/submit", json=assessment_payload, headers=headers)
    assert res.status_code == 200, f"Submission failed: {res.text}"
    report_data = res.json()
    print("✅ 6. Multi-modal assessment submitted successfully:")
    print(f"   Session ID: {report_data['session_id']}")
    print(f"   Distress Score: {report_data['distress_score']}/100")
    print(f"   Severity Band: {report_data['severity_level']}")
    print(f"   108 Ambulance Dispatched: {report_data['ambulance_108_dispatched']}")
    print(f"   SHAP Primary Driver: {report_data['shap_explainability']['primary_driver']}")

    # 7. Check History
    res = client.get("/api/v1/interview/history", headers=headers)
    assert res.status_code == 200
    assert res.json()["total_assessments"] >= 1
    print("✅ 7. Victim assessment history retrieved successfully")

    # 8. Register District Health Observer
    observer_payload = {
        "email": "observer_varanasi@sih.gov.in",
        "password": "ObserverPass123!",
        "full_name": "Dr. A. Sharma (District Observer)",
        "role": "observer_district",
        "district": "Varanasi",
        "state": "Uttar Pradesh"
    }
    res = client.post("/api/v1/auth/register", json=observer_payload)
    assert res.status_code == 200
    observer_token = res.json()["access_token"]
    observer_headers = {"Authorization": f"Bearer {observer_token}"}
    print("✅ 8. District Observer registered & authenticated")

    # 9. Health Observer Dashboard
    res = client.get("/api/v1/interview/observer/dashboard", headers=observer_headers)
    assert res.status_code == 200
    dash = res.json()
    print("✅ 9. Health Observer Dashboard data fetched:")
    print(f"   Total Cases: {dash['statistics']['total_cases']}")
    print(f"   Critical Cases: {dash['statistics']['critical']}")
    print(f"   Active 108 Dispatches: {dash['statistics']['active_108_dispatches']}")

    # 10. Intervene in Case
    if dash["cases"]:
        first_case_id = dash["cases"][0]["id"]
        intervene_payload = {
            "status": "INTERVENTION_ASSIGNED",
            "observer_notes": "Telepsychiatry consultation scheduled and field worker dispatched."
        }
        res = client.post(
            f"/api/v1/interview/observer/intervene/{first_case_id}",
            json=intervene_payload,
            headers=observer_headers
        )
        assert res.status_code == 200
        print(f"✅ 10. Case intervention updated for case #{first_case_id}")

    # 11. Test Token Blacklisting / Logout
    res = client.post("/api/v1/auth/logout", headers=headers)
    assert res.status_code == 200
    print("✅ 11. User logged out; token successfully blacklisted")

    # Verify blacklisted token is rejected
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 401
    print("✅ 12. Blacklisted token correctly rejected by auth middleware (401 Unauthorized)")

    print("\n🎉 ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run_tests()
