from collections import defaultdict
from functools import reduce
import random
from typing import Literal, Optional
from pydantic import BaseModel
from rest_framework.views import APIView, Response
from django.db.models import Prefetch
from rest_framework.permissions import IsAdminUser
from drf_spectacular.utils import extend_schema
from common.services.schedule import BacktrackingScheduleGenerator, GeneticScheduleGenerator, GreedyScheduleGenerator
from schedule.models import Class, ClassSubject, Faculty, TeacherSubject, Schedule, TeacherUnavailableSlot, Auditory
from schedule.serializers import ScheduleSerializer
from django.contrib.auth import get_user_model
from django.db import transaction

user_model = get_user_model()

# Pydantic models
class ScheduleLesson(BaseModel):
    subject: str
    teacher: str
    auditory: Optional[str] = None

class ScheduleDay(BaseModel):
    day: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    lessons: list[ScheduleLesson | None]

class ScheduleClass(BaseModel):
    faculty: str
    class_name: str
    week: list[ScheduleDay]
    general_amount_of_lessons: int

class ScheduleResponse(BaseModel):
    schedule: list[ScheduleClass]

ALGORITHMS = {
    "greedy": GreedyScheduleGenerator,
    "backtracking": BacktrackingScheduleGenerator,
    "genetic": GeneticScheduleGenerator
}

# API view
@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'lessons_per_day': {'type': 'integer', 'example': 4},
                'algorithm': {
                    'type': 'string',
                    'enum': list(ALGORITHMS.keys()),
                    'default': 'greedy',
                    'example': 'greedy'
                }
            }
        }
    },
)
class GenerateScheduleManuallyView(APIView):
    # permission_classes = [IsAdminUser]

    def post(self, request):
        algorithm = request.data.get("algorithm", "greedy")
        days_per_week = request.data.get("days_per_week", 5)
        lessons_per_day = request.data.get("lessons_per_day", 4)
        use_auditories = request.data.get("auditory", False)
        total_slots = days_per_week * lessons_per_day 

        if days_per_week <= 0 or lessons_per_day <= 0:
            return Response({"error": "Invalid days_per_week or lessons_per_day"}, status=400)

        if algorithm not in ALGORITHMS:
            return Response({"error": "Invalid algorithm specified."}, status=400)

        if days_per_week > 7 or lessons_per_day > 6:
            return Response({"error": "days_per_week must be <= 7 and lessons_per_day must be <= 6"}, status=400)


        faculties = Faculty.objects.prefetch_related(
            Prefetch(
                "class_set",
                queryset=Class.objects.prefetch_related(
                    Prefetch(
                        "classsubject_set",
                        queryset=ClassSubject.objects.prefetch_related(
                            Prefetch(
                                "subject__teachersubject_set",
                                queryset=TeacherSubject.objects.select_related("teacher")
                            )
                        ).select_related("subject")
                    )
                )
            )
        )

        # Підготовка сирих даних
        data = []
        for faculty in faculties:
            faculty_dict = {
                "faculty_name": faculty.name,
                "classes": []
            }
            for cls in faculty.class_set.all():
                class_dict = {
                    "class_name": cls.name,
                    "number_of_lessons_per_week": reduce(
                        lambda acc, cs: acc + cs.maximum_per_week,
                        cls.classsubject_set.all(),
                        0
                    ),
                    "subjects": []
                }
                for cls_subj in cls.classsubject_set.all():
                    subject = cls_subj.subject
                    teachers = [
                        f"{ts.teacher.first_name} {ts.teacher.last_name}"
                        for ts in subject.teachersubject_set.all()
                    ]
                    class_dict["subjects"].append({
                        "subject_name": subject.name,
                        "teachers": teachers,
                        "amount_for_class_per_week": cls_subj.maximum_per_week,
                    })
                faculty_dict["classes"].append(class_dict)
            data.append(faculty_dict)

        classes = {}
        class_to_faculty = {}
        for faculty in data:
            faculty_name = faculty['faculty_name']
            for cls in faculty['classes']:
                class_name = cls['class_name']
                class_to_faculty[class_name] = faculty_name
                classes[class_name] = []
                for subj in cls['subjects']:
                    for _ in range(subj['amount_for_class_per_week']):
                        classes[class_name].append({
                            'subject_name': subj['subject_name'],
                            'teacher': subj['teachers'][0]
                        })


        schedule = {class_name: [None] * total_slots for class_name in classes}
        teacher_unavailable = defaultdict(set)
        unavailables = TeacherUnavailableSlot.objects.all().select_related("teacher")
        for slot in unavailables:
            index = slot.day * lessons_per_day + slot.lesson_number
            teacher_unavailable[f"{slot.teacher.first_name} {slot.teacher.last_name}"].add(index)

        if use_auditories:
            auditories = Auditory.objects.all()
            if not auditories.exists():
                return Response({"error": "No auditories available."}, status=500)

        generator_class = ALGORITHMS.get(algorithm)
        if not generator_class:
            return Response({"error": "Invalid algorithm specified."}, status=400)

        auditoriums = list(Auditory.objects.all()) if use_auditories else None
        generator = generator_class(classes, total_slots, teacher_unavailable, auditoriums=auditoriums, use_auditories=use_auditories)
        schedule = generator.generate()
        if not schedule:
            return Response({"error": "Не вдалося згенерувати розклад за 1000 спроб."}, status=500)
        
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        schedule_classes = []

        for class_name, slots in schedule.items():
            week = []
            for day_index in range(days_per_week):
                day_name = days[day_index]
                lessons = []
                for lesson_index in range(lessons_per_day):
                    slot_index = day_index * lessons_per_day + lesson_index
                    slot_data = slots[slot_index]
                    if slot_data:
                        auditory = slot_data.get("auditory") if isinstance(slot_data, dict) else None
                        lesson = ScheduleLesson(
                            subject=slot_data["subject_name"],
                            teacher=slot_data["teacher"],
                            auditory=auditory
                        )
                    else:
                        lesson = None
                    lessons.append(lesson)
                week.append(ScheduleDay(day=day_name, lessons=lessons))

            schedule_classes.append(ScheduleClass(
                faculty=class_to_faculty[class_name],
                class_name=class_name,
                week=week,
                general_amount_of_lessons=len([s for s in slots if s is not None])
            ))

        response_data = ScheduleResponse(schedule=schedule_classes)
        return Response(response_data.dict(), status=200)

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'schedule': {'type': 'array', 'description': 'JSON-розклад, який зберігається'}
            },
            'required': ['schedule']
        }
    },
    responses={'201': {'type': 'object', 'properties': {'message': {'type': 'string'}}}},
    description="Зберігає згенерований розклад у базу даних"
)
class SaveScheduleView(APIView):
    # permission_classes = [IsAdminUser]

    def post(self, request):
        schedule_data = request.data.get("schedule")
        # if not request.user.is_authenticated:
        #     return Response({"error": "Permission denied"}, status=403)
        if not schedule_data:
            return Response({"error": "No schedule data provided"}, status=400)
        Schedule.objects.create(
            json_data=schedule_data,
            # generated_by=request.user
        )
        return Response({"message": "Schedule saved successfully"}, status=201)


class SchedulesByDatesView(APIView):
    serializer_class = ScheduleSerializer

    def get(self, request):
        # fetch dates
        dates = request.query_params.getlist('dates', None)
        if not dates:
            return Response({"error": "No dates provided"}, status=400)
        schedules = Schedule.objects.filter(
            created_at__date__in=dates
        ).order_by('-created_at')
        return Response(
            [
                {
                    "id": schedule.id,
                    "created_at": schedule.created_at.strftime("%Y-%m-%d"),
                    "updated_at": schedule.updated_at.strftime("%Y-%m-%d"),
                    "json_data": schedule.json_data
                }
                for schedule in schedules
            ],
        )

    def delete(self, request):
        # delete schedules by dates
        dates = request.query_params.getlist('dates', None)
        if not dates:
            return Response({"error": "No dates provided"}, status=400)
        schedules = Schedule.objects.filter(
            created_at__date__in=dates
        )
        if not schedules.exists():
            return Response({"error": "No schedules found for the provided dates"}, status=404)
        schedules.delete()
        return Response({"message": "Schedules deleted successfully"}, status=204)
        
@extend_schema(
    responses={
        '200': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer'},
                    'created_at': {'type': 'string'},
                    'updated_at': {'type': 'string'}
                }
            }
        }
    },
    description="Повертає історію всіх збережених розкладів з датами"
)
class ScheduleHistoryView(APIView):
    
    def get(self, request):
        # i need to get history dates
        schedules = Schedule.objects.all().order_by('-created_at')
        schedule_dates = [
            {
                "id": schedule.id,
                "created_at": schedule.created_at.strftime("%Y-%m-%d"),
                "updated_at": schedule.updated_at.strftime("%Y-%m-%d")
            }
            for schedule in schedules
        ]
        return Response(schedule_dates, status=200)

@extend_schema(
    responses={
        '200': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'teacher': {'type': 'string'},
                    'subject': {'type': 'string'}
                }
            }
        }
    },
    description="Повертає список усіх предметів, які викладає кожен вчитель"
)
class TeacherSubjectView(APIView):
    # permission_classes = [IsAdminUser]

    def get(self, request):
        teacher_subjects = TeacherSubject.objects.select_related('teacher', 'subject').all()
        data = [
            {
                "teacher": f"{ts.teacher.first_name} {ts.teacher.last_name}",
                "subject": ts.subject.name
            }
            for ts in teacher_subjects
        ]
        return Response(data, status=200)

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'unavailable_slots': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'teacher_email': {'type': 'string', 'example': 'example@gmail.com'},
                            'day': {'type': 'integer', 'example': 2},
                            'lesson_number': {'type': 'integer', 'example': 1}
                        }
                    }
                }
            }
        }
    },
    responses={
        '201': {
            'type': 'object',
            'properties': {
                'message': {'type': 'string'}
            }
        },
        '400': {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'}
            }
        }
    },
    description="Створює список слотів, коли викладачі недоступні"
)
class CreateBatchUnavailableSlotsView(APIView):
    # permission_classes = [IsAdminUser]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Permission denied"}, status=403)
        slots = TeacherUnavailableSlot.objects.select_related('teacher').filter(teacher=user).all()
        data = [
            {
                "id": slot.id,
                "teacher": f"{slot.teacher.first_name} {slot.teacher.last_name}",
                "day": slot.day,
                "lesson_number": slot.lesson_number
            }
            for slot in slots
        ]
        return Response(data, status=200)

    @transaction.atomic
    def delete(self, request):
        user = request.user
        slot_ids = request.query_params.getlist("slot_ids", [])

        if not user.is_authenticated:
            return Response({"error": "Permission denied"}, status=403)

        if not slot_ids:
            return Response({"error": "No slot IDs provided"}, status=400)

        try:
            slots = TeacherUnavailableSlot.objects.filter(id__in=slot_ids, teacher=user)
            if not slots.exists():
                return Response({"error": "No matching slots found"}, status=404)

            slots.delete()
            return Response({"message": "Slots deleted successfully"}, status=204)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
    @transaction.atomic
    def post(self, request):
        data = request.data.get("unavailable_slots", [])
        if not data:
            return Response({"error": "No unavailable slots provided"}, status=400)

        created_slots = []
        # remove all slots for the user by id
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Permission denied"}, status=403)
        existant_slots = TeacherUnavailableSlot.objects.filter(teacher=user)
        existant_slots.delete()
        for slot in data:
            try:
                teacher_email = slot.get("teacher_email")
                day = slot.get("day")
                lesson_number = slot.get("lesson_number")
                if not teacher_email or day is None or lesson_number is None:
                    continue
                teacher_instance = user_model.objects.get(email=teacher_email)
                new_slot = TeacherUnavailableSlot.objects.create(
                    teacher=teacher_instance,
                    day=day,
                    lesson_number=lesson_number
                )
                created_slots.append({
                    "id": new_slot.id,
                    "teacher": str(new_slot.teacher),
                    "day": new_slot.day,
                    "lesson_number": new_slot.lesson_number
                })
            except Exception as e:
                return Response({"error": str(e)}, status=500)

        return Response({"created_slots": created_slots}, status=201)
