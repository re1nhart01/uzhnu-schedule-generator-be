import { Lesson } from "@/types/schedule.interface";
import { FC } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type scheduleItemProps = {
  lesson: Lesson | null;
  id: string;
};

export const ScheduleItem: FC<scheduleItemProps> = ({ lesson, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <li
      key={id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center border-t px-4 py-3 text-sm"
    >
      {lesson ? (
        <>
          <span className="text-foreground">{lesson.subject}</span>
          <span className="text-muted-foreground">{lesson.teacher}</span>
        </>
      ) : (
        <span className="text-muted-foreground italic w-full text-center">
          —
        </span>
      )}
    </li>
  );
};
