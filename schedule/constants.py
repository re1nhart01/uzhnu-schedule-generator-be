prompt_text = """
Create a school schedule in JSON format where:

1. NO TEACHER can teach two classes at the same time (critical!)
2. Maximum 4 lessons per day per class
3. Each subject must have exactly the number of lessons specified in "amount_for_class_per_week"

Before returning your answer:
- Check that no teacher appears twice in the same time slot across different classes
- Verify all subject lesson counts match requirements

JSON format:
{{
  "schedule": [
    {{
      "faculty": "FIT",
      "class_name": "KN-54",
      "week": [
        {{
          "day": "Monday",
          "lessons": [{{"subject": "Math", "teacher": "Teacher Name", "lesson_number": 1}}]
        }}
      ],
      "general_amount_of_lessons": 10
    }}
  ]
}}

Input Data:
{combined_data}

"""
# [{'faculty_name': 'FIT', 'classes': [{'class_name': 'KN-54', 'number_of_lessons_per_week': 10, 'subjects': [{'subject_name': 'Math', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'Physics', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'English', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'Programming', 'teachers': ['flameless osu!'], 'amount_for_class_per_week': 2}, {'subject_name': 'Assembler', 'teachers': ['flameless osu!'], 'amount_for_class_per_week': 2}]}, {'class_name': 'KN-27', 'number_of_lessons_per_week': 10, 'subjects': [{'subject_name': 'Assembler', 'teachers': ['flameless osu!'], 'amount_for_class_per_week': 2}, {'subject_name': 'Math', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'Physics', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'English', 'teachers': ['Крістіан Бачинський'], 'amount_for_class_per_week': 2}, {'subject_name': 'Programming', 'teachers': ['flameless osu!'], 'amount_for_class_per_week': 2}]}]}]
new_prompt = """
You are a JSON Schedule Creation Assistant. Your task is to generate a weekly class schedule for the given groups so that no teacher is assigned to more than one lesson at the same time.

Input data:
{combined_data}

Constraints

    No teacher may teach more than one lesson simultaneously (HIGHEST PRIORITY).

    Each class can have a maximum of 4 lessons per day.

    Each subject must appear exactly amount_for_class_per_week times per class.

    Use all five weekdays (Monday through Friday) whenever possible.

    Empty time slots must be filled with:
    {{
    "subject": "/No Lesson/",
    "teacher": "/No Teacher/",
    "lesson_number": X
    }}

Output format (JSON)
– The top‐level object must have a key "schedule" whose value is an array of class schedules.
– Each class schedule object contains:
• "faculty": the faculty name
• "class_name": the class name
• "week": an array of five day objects, one per weekday
• Each day object has
– "day": the day of the week (e.g. "Monday")
– "lessons": an array of exactly four lesson-slot objects, in order
• Each lesson-slot object has
– "subject": the subject name or "/No Lesson/"
– "teacher": the teacher name or "/No Teacher/"
– "lesson_number": 1, 2, 3, or 4
• "general_amount_of_lessons": total number of scheduled lessons for that class (e.g. 10)

Post-generation validation process
Step 1 – Teacher Conflict Check
• For each day and each lesson_number (1-4), collect all assigned teachers across all classes.
• If any teacher appears more than once in the same slot, the schedule must be rebuilt to resolve the conflict.

Step 2 – Lesson Count Verification
• For each class and each subject, count how many lessons were scheduled.
• Verify that this count equals the required amount_for_class_per_week.
• If there is any mismatch, adjust the schedule accordingly.

Step 3 – JSON Structure Validation
• Ensure the output exactly matches the described JSON structure.
• Verify all required fields are present and correctly populated.
• Confirm that any unused lesson slots use the "/No Lesson/" and "/No Teacher/" placeholders.

Final instruction
After all three validation steps pass without any issues, return the completed JSON schedule.
If it is impossible to satisfy all constraints simultaneously, return a JSON error object explaining which specific constraints cannot be met.
"""
# - You can skip lesson if overlapping with teacher's unavailable time. Return none for that lesson.
# - Try to distribute lessons evenly across the week while minimizing number of skipped lessons.
# - No teacher can have overlapping lessons between different classes (no teacher assigned to two classes simultaneously).