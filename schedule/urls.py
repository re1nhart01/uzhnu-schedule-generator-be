from django.urls import path

from schedule.views import GenerateScheduleManuallyView, GenerateScheduleView, SaveScheduleView, ScheduleHistoryView, TeacherSubjectView, SchedulesByDatesView

urlpatterns = [
    path("generate-schedule/", GenerateScheduleView.as_view(), name="generate_schedule"),
    path("generate-schedule/manually/", GenerateScheduleManuallyView.as_view(), name="generate_schedule_manual"),
    path("save/", SaveScheduleView.as_view(), name="save_schedule"),
    path("history/", ScheduleHistoryView.as_view(), name="schedule_history"),
    path("get-by-dates/", SchedulesByDatesView.as_view(), name="schedules_by_dates"),
    path("teachers-subjects/", TeacherSubjectView.as_view(), name="teachers_subjects_schedule"),
]