from django.urls import path

from schedule.views import GenerateScheduleManuallyView, GenerateScheduleView

urlpatterns = [
    path("generate-schedule/", GenerateScheduleView.as_view(), name="generate_schedule"),
    path("generate-schedule/manually/", GenerateScheduleManuallyView.as_view(), name="generate_schedule_manual"),
]