from pydantic import BaseModel
from typing import List


class Task(BaseModel):
    description: str
    due_date: str | None = None


class EmailInput(BaseModel):
    sender: str
    subject: str
    body: str


class TriageResult(BaseModel):
    category: str
    priority: str
    summary: str
    tasks: List[Task]

class DraftRequest(BaseModel):
    email: str