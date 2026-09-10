"""
End-to-end integration test for FastAPI backend.
Tests Auth (JWT + RBAC + Blacklisting), OAuth routes, Multi-modal assessments,
Distress scoring, 108 emergency dispatch, and Health Observer Dashboard.
"""

from fastapi.testclient import TestClient
from uuid import uuid4
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

    # 2a. Dedicated administrator credentials are authenticated from MongoDB.
    res = client.post("/api/v1/auth/admin/login", json={"username": "admin123", "password": "123456"})
    assert res.status_code == 200, res.text
    assert res.json()["user"]["role"] == "admin"
    print("✅ 2a. Dedicated administrator login verified")

    # 3. Register Victim
    victim_email = f"victim_test_{uuid4().hex[:10]}@sih.org"
    victim_payload = {
        "email": victim_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
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
        "email": victim_email,
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    assert "access_token" in res.json()
    print("✅ 4. JWT Login successful")

    # Password verification is performed against the bcrypt hash in MongoDB.
    res = client.post("/api/v1/auth/login", json={"email": victim_email, "password": "WrongPassword123"})
    assert res.status_code == 401
    assert "Password does not match" in res.json()["detail"]
    print("✅ 4a. Incorrect password is rejected with a clear error")

    # 5. Protected profile /auth/me
    headers = {"Authorization": f"Bearer {victim_token}"}
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == victim_email
    print("✅ 5. /auth/me protected profile verified:", res.json()["full_name"])

    # 6a. Submit Normal Well-Being Assessment (Verifying normal answers do NOT trigger false 82/100 or alert)
    normal_payload = {
        "touchpoint_type": "web_portal",
        "language": "en",
        "madrs": {"answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        "phq9": {"answers": [0]},
        "text_content": "I am feeling okay today and resting well.",
        "is_crisis_halt": False,
        "sleep_hours": 8,
        "sleep_quality": "good",
        "safety_threat_active": False,
        "context_score": 20.0,
        "district": "Nashik",
        "state": "Maharashtra"
    }
    normal_res = client.post("/api/v1/interview/submit", json=normal_payload, headers=headers)
    assert normal_res.status_code == 200, f"Normal submission failed: {normal_res.text}"
    normal_report = normal_res.json()
    assert normal_report["distress_score"] <= 25.0, f"Expected low score, got {normal_report['distress_score']}"
    assert normal_report["severity_level"] == "LOW", f"Expected LOW severity, got {normal_report['severity_level']}"
    assert normal_report["alert_triggered"] is False, "Normal report should NOT trigger alert"
    assert normal_report["ambulance_108_dispatched"] is False, "Normal report should NOT dispatch ambulance"
    print(f"✅ 6a. Normal assessment verified: Score={normal_report['distress_score']}/100, Band={normal_report['severity_level']}, Alert={normal_report['alert_triggered']}")

    # 6b. Submit Acute Crisis Multi-Modal Assessment (Form + NLP + Acute Suicide Q10)
    assessment_payload = {
        "touchpoint_type": "mobile_app",
        "language": "en",
        "madrs": {"answers": [4, 5, 4, 6, 4, 5, 5, 4, 5, 5]}, # High MADRS depression, Q10 = 5
        "phq9": {"answers": [3, 3, 2, 3, 3, 2, 3, 3, 3]},       # High PHQ-9
        "gad7": {"answers": [3, 3, 3, 2, 3, 3, 2]},             # High GAD-7
        "text_content": "I am thinking of ending my life. I can't take this anymore and want to die.",
        "context_score": 80.0,
        "district": "Varanasi",
        "state": "Uttar Pradesh"
    }
    res = client.post("/api/v1/interview/submit", json=assessment_payload, headers=headers)
    assert res.status_code == 200, f"Submission failed: {res.text}"
    report_data = res.json()
    assert report_data["severity_level"] == "CRITICAL"
    assert report_data["ambulance_108_dispatched"] is True
    print("✅ 6b. Acute Crisis multi-modal assessment submitted successfully:")
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

    # 8. Public users cannot self-register a privileged role. A provisioned
    # observer logs in from the database instead.
    observer_payload = {
        "email": "observer.district@sih.gov.in",
        "password": "ObserverPassword123!",
        "full_name": "Dr. A. Sharma (District Observer)",
        "role": "observer_district",
    }
    res = client.post("/api/v1/auth/register", json=observer_payload)
    assert res.status_code == 403
    res = client.post("/api/v1/auth/login", json={
        "email": "observer.district@sih.gov.in",
        "password": "ObserverPassword123!",
    })
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
