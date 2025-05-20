from typing import Literal
from pydantic import BaseModel
from rest_framework.views import APIView, Response

from schedule.models import Class, ClassSubject, TeacherSubject
from rest_framework.permissions import IsAdminUser
from common.services.openai import OpenAIService

class ScheduleLesson(BaseModel):
    subject: str
    teacher: str


class ScheduleDay(BaseModel):
    day: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    lessons: list[ScheduleLesson]
    

class ScheduleResponse(BaseModel):
    schedule: list[ScheduleDay]

# Create your views here.

class GenerateScheduleView(APIView):
    MAX_LESSONS_PER_DAY = 4
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        openai_service = OpenAIService()
        class_name = request.data.get("class_name", None)
        class_object = Class.objects.filter(name=class_name).first()
        if not class_object:
            return Response({"error": "Class not found"}, status=404)
        
        class_subjects = ClassSubject.objects.filter(class_name__name=class_name)
        subject_teachers = TeacherSubject.objects.filter(
            subject__in=class_subjects.values_list("subject", flat=True)
        )
        print(subject_teachers)
        print(class_subjects)
        class_subjects_dict = class_subjects.values(
            "subject__name", "maximum_per_week"
        )
        subject_teachers_dict = subject_teachers.values(
            "subject__name", "teacher__first_name", "teacher__last_name"
        )
        schedule_json = openai_service.make_request_with_structured_result(
            prompt="Generate a schedule for the following class and subjects. You should evenly distribute the lessons across the week, depending on maximum per week",
            response_model=ScheduleResponse,
            messages=[
                {
                    "role": "user",
                    "content": f"Class: {class_name}, Subjects: {class_subjects_dict}, Teachers: {subject_teachers_dict}, Max lessons per day: {self.MAX_LESSONS_PER_DAY}",
                }
            ],
        )
        print(schedule_json)
        return Response({"message": "Schedule generated successfully"}, status=200)
