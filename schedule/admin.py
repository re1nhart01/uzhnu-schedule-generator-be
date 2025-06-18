from django.contrib import admin
from .models import Auditory, Subject, Class, TeacherSubject, ClassSubject, TeacherUnavailableSlot, TeacherUnavailableTime, Faculty

# Register your models here.

admin.site.register(Subject)
admin.site.register(Class)
admin.site.register(Faculty)
admin.site.register(TeacherSubject)
admin.site.register(ClassSubject)
admin.site.register(TeacherUnavailableSlot)
admin.site.register(Auditory)

admin.site.site_title = "Schedule Admin"
admin.site.site_header = "Schedule Administration"
admin.site.index_title = "Welcome to the Schedule Admin"