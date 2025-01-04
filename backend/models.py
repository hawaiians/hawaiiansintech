from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field, model_validator
from google.cloud.firestore_v1.document import DocumentReference

from .enums import CompanySizeEnum, StatusEnum, YearsOfExperienceEnum


class DocRef(BaseModel):
    id: str

    @model_validator(mode="before")
    @classmethod
    def validate_ref(cls, value: Any) -> dict:
        if isinstance(value, DocumentReference):
            return {"id": value.id}
        if isinstance(value, str):
            return {"id": value}
        if isinstance(value, dict) and "id" in value:
            return value
        raise ValueError(f"Invalid document reference: {value}")

    def __str__(self):
        return self.id

    def model_dump(self, **kwargs):
        return self.id


class Filter(BaseModel):
    id: str
    name: str
    members: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def convert_members(cls, values: dict) -> dict:
        if "members" in values:
            if isinstance(values["members"], list):
                values["members"] = [
                    (
                        ref.id
                        if isinstance(ref, DocumentReference)
                        else (
                            ref
                            if isinstance(ref, str)
                            else ref.id if hasattr(ref, "id") else str(ref)
                        )
                    )
                    for ref in values["members"]
                ]
        return values


class Industry(Filter):
    status: StatusEnum


class Focus(Filter):
    status: StatusEnum


class Region(Filter):
    latitude: Optional[str]
    longitude: Optional[str]


class MemberPublic(BaseModel):
    company_size: Optional[CompanySizeEnum]
    focuses: List[DocRef]
    industries: List[DocRef]
    link: str
    location: str
    masked_email: str
    name: str
    regions: List[DocRef]
    title: str
    years_experience: Optional[YearsOfExperienceEnum]
    id: str
    last_modified: Optional[datetime] = None
    last_modified_by: Optional[DocRef] = None
    requests: Optional[str] = None
    status: Optional[StatusEnum] = None
    unsubscribed: Optional[bool] = None

    class Config:
        # This is to allow the use of DocumentReference in the pydantic model
        json_encoders = {DocRef: lambda v: str(v)}
