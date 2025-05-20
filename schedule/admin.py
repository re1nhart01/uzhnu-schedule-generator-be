from django.contrib import admin
from .models import Subject, Class, TeacherSubject, ClassSubject, TeacherUnavailableTime

# Register your models here.

admin.site.register(Subject)
admin.site.register(Class)
admin.site.register(TeacherSubject)
admin.site.register(ClassSubject)
admin.site.register(TeacherUnavailableTime)