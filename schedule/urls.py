from django.urls import path

from schedule.views import GenerateScheduleView

urlpatterns = [
    path("generate-schedule/", GenerateScheduleView.as_view(), name="generate_schedule"),
]