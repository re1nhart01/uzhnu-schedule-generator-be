from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.

user_model = get_user_model()

class Subject(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Faculty(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Faculties"
        ordering = ['name']


class Class(models.Model):
    name = models.CharField(max_length=100, unique=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Classes"
        ordering = ['name']

class TeacherSubject(models.Model):
    teacher = models.ForeignKey(user_model, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher.first_name} {self.teacher.last_name} - {self.subject.name}"


class ClassSubject(models.Model):
    class_name = models.ForeignKey(Class, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    maximum_per_week = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.class_name.name} - {self.subject.name} - {self.maximum_per_week}"

class TeacherUnavailableTime(models.Model):
    teacher = models.ForeignKey(user_model, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher.username} - {self.start_time} to {self.end_time}"

    class Meta:
        verbose_name_plural = "Teacher Unavailable Times"

class Schedule(models.Model):
    json_data = models.JSONField()
    generated_by = models.ForeignKey(user_model, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TeacherUnavailableSlot(models.Model):
    teacher = models.ForeignKey(user_model, on_delete=models.CASCADE)
    day = models.IntegerField()  # 0 to 6 for Sunday to Saturday
    lesson_number = models.IntegerField()  # 0 to 3

    def __str__(self):
        return f"{self.teacher.first_name} {self.teacher.last_name} - Day: {self.day}, Lesson: {self.lesson_number}"