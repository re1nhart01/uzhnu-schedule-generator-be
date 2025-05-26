"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, FC, SetStateAction } from "react";

type updateModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const UpdateModal: FC<updateModalProps> = ({ open, setOpen }) => {
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Відкрити модалку</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заголовок</DialogTitle>
          <DialogDescription>Це опис до модального вікна.</DialogDescription>
        </DialogHeader>

        <div className="py-4">Тут може бути ваш контент</div>

        <DialogFooter>
          <DialogClose asChild onClick={() => setOpen(false)}>
            <Button variant="secondary">Закрити</Button>
          </DialogClose>
          <Button>Зберегти</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
