from collections import defaultdict
import random
from common.services.base.schedule_generator import BaseScheduleGenerator


class GreedyScheduleGenerator(BaseScheduleGenerator):
    def generate(self):
        for _ in range(1000):
            schedule = {class_name: [None] * self.total_slots for class_name in self.classes}
            teacher_busy = defaultdict(lambda: [False] * self.total_slots)
            auditories_busy = defaultdict(lambda: [False] * self.total_slots) if self.use_auditories else None

            for class_name in self.classes:
                random.shuffle(self.classes[class_name])

            success = True
            for class_name, subjects in self.classes.items():
                for subj in subjects:
                    placed = False
                    attempts = list(range(self.total_slots))
                    random.shuffle(attempts)
                    for i in attempts:
                        if (
                            schedule[class_name][i] is None and
                            not teacher_busy[subj['teacher']][i] and
                            i not in self.teacher_unavailable[subj['teacher']]
                        ):
                            if self.use_auditories:
                                for aud in self.auditoriums:
                                    if not auditories_busy[aud.number][i]:
                                        schedule[class_name][i] = {
                                            "subject_name": subj["subject_name"],
                                            "teacher": subj["teacher"],
                                            "auditory": aud.number
                                        }
                                        teacher_busy[subj['teacher']][i] = True
                                        auditories_busy[aud.number][i] = True
                                        placed = True
                                        break
                            else:
                                schedule[class_name][i] = subj
                                teacher_busy[subj['teacher']][i] = True
                                placed = True
                            if placed:
                                break
                    if not placed:
                        success = False
                        break
                if not success:
                    break

            if success:
                return schedule
        return None


class BacktrackingScheduleGenerator(BaseScheduleGenerator):
    def generate(self):
        schedule = {class_name: [None] * self.total_slots for class_name in self.classes}
        teacher_busy = defaultdict(lambda: [False] * self.total_slots)
        auditories_busy = defaultdict(lambda: [False] * self.total_slots) if self.use_auditories else None

        class_names = list(self.classes.keys())
        subject_indices = {class_name: 0 for class_name in class_names}

        def backtrack(class_index):
            if class_index >= len(class_names):
                return True

            class_name = class_names[class_index]
            subjects = self.classes[class_name]
            if subject_indices[class_name] >= len(subjects):
                return backtrack(class_index + 1)

            subj = subjects[subject_indices[class_name]]
            for i in range(self.total_slots):
                if (
                    schedule[class_name][i] is None and
                    not teacher_busy[subj['teacher']][i] and
                    i not in self.teacher_unavailable[subj['teacher']]
                ):
                    if self.use_auditories:
                        for aud in self.auditoriums:
                            if not auditories_busy[aud.number][i]:
                                schedule[class_name][i] = {
                                    "subject_name": subj["subject_name"],
                                    "teacher": subj["teacher"],
                                    "auditory": aud.number
                                }
                                teacher_busy[subj['teacher']][i] = True
                                auditories_busy[aud.number][i] = True
                                subject_indices[class_name] += 1

                                if backtrack(class_index):
                                    return True

                                schedule[class_name][i] = None
                                teacher_busy[subj['teacher']][i] = False
                                auditories_busy[aud.number][i] = False
                                subject_indices[class_name] -= 1
                    else:
                        schedule[class_name][i] = subj
                        teacher_busy[subj['teacher']][i] = True
                        subject_indices[class_name] += 1

                        if backtrack(class_index):
                            return True

                        schedule[class_name][i] = None
                        teacher_busy[subj['teacher']][i] = False
                        subject_indices[class_name] -= 1

            return False

        for class_name in class_names:
            random.shuffle(self.classes[class_name])

        success = backtrack(0)
        return schedule if success else None
























import random
import copy

class GeneticScheduleGenerator(BaseScheduleGenerator):
    POPULATION_SIZE = 50
    GENERATIONS = 200
    MUTATION_RATE = 0.1
    TOURNAMENT_SIZE = 5

    def generate(self):
        population = [self._random_schedule() for _ in range(self.POPULATION_SIZE)]

        for _ in range(self.GENERATIONS):
            scored = [(self._fitness(ind), ind) for ind in population]
            scored.sort(key=lambda x: x[0])

            if scored[0][0] == 0:
                return scored[0][1]

            new_population = [scored[0][1], scored[1][1]]

            while len(new_population) < self.POPULATION_SIZE:
                parent1 = self._tournament_selection(scored)
                parent2 = self._tournament_selection(scored)
                child = self._crossover(parent1, parent2)
                self._mutate(child)
                new_population.append(child)

            population = new_population

        return scored[0][1] if scored else None

    def _random_schedule(self):
        schedule = {cls: [None] * self.total_slots for cls in self.classes}
        teacher_busy = defaultdict(lambda: [False] * self.total_slots)

        for cls, subjects in self.classes.items():
            subject_copies = subjects.copy()
            random.shuffle(subject_copies)
            for subj in subject_copies:
                tries = list(range(self.total_slots))
                random.shuffle(tries)
                for slot in tries:
                    teacher = subj["teacher"]
                    if (
                        schedule[cls][slot] is None and
                        not teacher_busy[teacher][slot] and
                        slot not in self.teacher_unavailable[teacher]
                    ):
                        schedule[cls][slot] = subj
                        teacher_busy[teacher][slot] = True
                        break
        return schedule

    def _fitness(self, schedule):
        penalty = 0
        teacher_busy = defaultdict(set)
        for cls, slots in schedule.items():
            for i, lesson in enumerate(slots):
                if lesson is None:
                    penalty += 1
                    continue
                teacher = lesson["teacher"]
                if i in teacher_busy[teacher]:
                    penalty += 5
                if i in self.teacher_unavailable[teacher]:
                    penalty += 10
                teacher_busy[teacher].add(i)
        return penalty

    def _tournament_selection(self, scored_population):
        return copy.deepcopy(min(random.sample(scored_population, self.TOURNAMENT_SIZE), key=lambda x: x[0])[1])

    def _crossover(self, parent1, parent2):
        child = {}
        for cls in self.classes:
            if random.random() < 0.5:
                child[cls] = parent1[cls][:]
            else:
                child[cls] = parent2[cls][:]
        return child

    def _mutate(self, schedule):
        for cls in self.classes:
            if random.random() < self.MUTATION_RATE:
                a, b = random.sample(range(self.total_slots), 2)
                schedule[cls][a], schedule[cls][b] = schedule[cls][b], schedule[cls][a]
