from collections import defaultdict
from functools import reduce
import random
from typing import Literal
from pydantic import BaseModel
from rest_framework.views import APIView, Response
from django.db.models import Prefetch
from rest_framework.permissions import IsAdminUser

from schedule.models import Class, ClassSubject, Faculty, TeacherSubject, Schedule, TeacherUnavailableSlot

# Pydantic models
class ScheduleLesson(BaseModel):
    subject: str
    teacher: str

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

# API view
class GenerateScheduleManuallyView(APIView):
    # permission_classes = [IsAdminUser]

    def post(self, request):
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

        # Параметри розкладу
        days_per_week = request.data.get("days_per_week", 5)  # 5 днів на тиждень
        lessons_per_day = request.data.get("lessons_per_day", 4)  # 4 уроки на день
        total_slots = days_per_week * lessons_per_day  # 20 слотів на тиждень

        # Підготовка даних по класах
        # Підготовка даних по класах (з faculty_name)
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


        # Ініціалізація
        schedule = {class_name: [None] * total_slots for class_name in classes}
        teacher_busy = defaultdict(lambda: [False] * total_slots)
        # Збір даних про вільні слоти вчителів
        teacher_unavailable = defaultdict(set)
        unavailables = TeacherUnavailableSlot.objects.all().select_related("teacher")
        for slot in unavailables:
            index = slot.day * lessons_per_day + slot.lesson_number
            teacher_unavailable[f"{slot.teacher.first_name} {slot.teacher.last_name}"].add(index)

        # Алгоритм генерації
        def generate_schedule():
            for class_name, subjects in classes.items():
                random.shuffle(subjects)
                for subj in subjects:
                    placed = False
                    attempts = list(range(total_slots))
                    random.shuffle(attempts)
                    for i in attempts:
                        if schedule[class_name][i] is None and not teacher_busy[subj['teacher']][i] and i not in teacher_unavailable[subj['teacher']]:
                            schedule[class_name][i] = subj
                            teacher_busy[subj['teacher']][i] = True
                            placed = True
                            break
                    if not placed:
                        return False
            return True

        # Генерація з обмеженням на 1000 спроб
        for _ in range(1000):
            schedule = {class_name: [None] * total_slots for class_name in classes}
            teacher_busy = defaultdict(lambda: [False] * total_slots)
            if generate_schedule():
                break
        else:
            return Response({"error": "Не вдалося згенерувати розклад за 1000 спроб."}, status=500)

        # Побудова структури Pydantic
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
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
                        lesson = ScheduleLesson(
                            subject=slot_data["subject_name"],
                            teacher=slot_data["teacher"]
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

class GenerateScheduleView(APIView):
    MAX_LESSONS_PER_DAY = 4
    permission_classes = [IsAdminUser]
    
    def post(self, request):
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
        combined_data = []
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
            combined_data.append(faculty_dict)
        openai_service = OpenAIService()
        print(combined_data)
        print('====================================================')
        # schedule_json = openai_service.make_request_with_structured_result(
        # prompt=new_prompt.format(combined_data=combined_data),
        # response_model=ScheduleResponse,
        # )
        schedule_json = openai_service.openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt_text.format(combined_data=combined_data)
                }
            ]
        )
        print(schedule_json)
        return Response({"message": "Schedule generated successfully"}, status=200)

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

# class TeacherUnavailableSlot(models.Model):
#     teacher = models.ForeignKey(user_model, on_delete=models.CASCADE)
#     day = models.IntegerField()  # 0 to 6 for Sunday to Saturday
#     lesson_number = models.IntegerField()  # 0 to 3

#     def __str__(self):
#         return f"{self.teacher.first_name} {self.teacher.last_name} - Day: {self.day}, Lesson: {self.lesson_number}"

class CreateBatchUnavailableSlotsView(APIView):
    # permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data.get("unavailable_slots", [])
        if not data:
            return Response({"error": "No unavailable slots provided"}, status=400)

        created_slots = []
        for slot in data:
            try:
                teacher = slot.get("teacher")
                day = slot.get("day")
                lesson_number = slot.get("lesson_number")
                if not teacher or day is None or lesson_number is None:
                    continue
                teacher_instance = TeacherSubject.objects.get(teacher__username=teacher).teacher
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
