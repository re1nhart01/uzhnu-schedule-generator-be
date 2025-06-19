from abc import ABC, abstractmethod
from collections import defaultdict
import random

class BaseScheduleGenerator(ABC):
    def __init__(self, classes, total_slots, teacher_unavailable, use_auditories=False, auditoriums=None):
        self.classes = classes
        self.total_slots = total_slots
        self.teacher_unavailable = teacher_unavailable
        self.use_auditories = use_auditories
        self.auditoriums = auditoriums or []
        self.auditories_busy = defaultdict(lambda: [False] * total_slots) if use_auditories else None

    @abstractmethod
    def generate(self):
        pass
