"""Schema audit trail per ogni dataset processato.

Esposto nel sito via tooltip su ogni chart e nella pagina /metodologia.
Spec sezione 4.6 — audit trail.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class AuditTrail(BaseModel):
    """Metadata audit trail per ogni dataset processato."""

    source: str = Field(..., description="Human-readable source name")
    source_url: str = Field(..., description="Primary source URL")
    downloaded_at: datetime
    pipeline_version: str = Field(..., description="Git SHA della pipeline al build time")
    transforms_applied: list[str] = Field(default_factory=list)
    validation_passed: bool
    datapoint_count: int = Field(..., ge=0)
    notes: str | None = None
