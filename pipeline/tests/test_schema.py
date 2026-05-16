from datetime import UTC, datetime

from sources.schema import AuditTrail


def test_audit_trail_required_fields():
    trail = AuditTrail(
        source="ISTAT DCIS_FECONDITA1",
        source_url="http://sdmx.istat.it/SDMXWS/rest/data/DCIS_FECONDITA1",
        downloaded_at=datetime(2026, 5, 16, 14, 30, 0, tzinfo=UTC),
        pipeline_version="abc123",
        transforms_applied=["normalize_year"],
        validation_passed=True,
        datapoint_count=73,
    )
    assert trail.source == "ISTAT DCIS_FECONDITA1"
    assert trail.datapoint_count == 73


def test_audit_trail_json_serialization():
    trail = AuditTrail(
        source="test",
        source_url="http://example.com",
        downloaded_at=datetime(2026, 5, 16, tzinfo=UTC),
        pipeline_version="v1",
        transforms_applied=[],
        validation_passed=True,
        datapoint_count=0,
    )
    payload = trail.model_dump_json()
    assert "downloaded_at" in payload
    assert "2026-05-16" in payload


def test_audit_trail_rejects_negative_count():
    import pytest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        AuditTrail(
            source="x",
            source_url="x",
            downloaded_at=datetime(2026, 1, 1, tzinfo=UTC),
            pipeline_version="x",
            validation_passed=True,
            datapoint_count=-1,
        )
