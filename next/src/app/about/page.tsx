"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const team = [
  {
    name: "Кокайко Євген Олександрович",
    github: "https://github.com/eugenekokayko",
    linkedin: "https://www.linkedin.com/in/eugenekokayko",
    email: "eugen.kokayko@example.com",
    photo: "/avatars/eugene.jpg",
  },
  {
    name: "Бачинський Крістіан Вікторович",
    github: "https://github.com/kristianbachynskyi",
    linkedin: "https://www.linkedin.com/in/kristianbachynskyi",
    email: "kristian.bachynskyi@example.com",
    photo: "/avatars/kristian.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Про додаток</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {team.map((person) => (
          <Card key={person.name}>
            <CardHeader>
              <CardTitle>{person.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-40 bg-muted rounded-md overflow-hidden relative">
                <Image
                  src={person.photo}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${person.email}`}
                    className="underline text-sm"
                  >
                    {person.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <Link
                    href={person.github}
                    className="underline text-sm"
                    target="_blank"
                  >
                    GitHub
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  <Link
                    href={person.linkedin}
                    className="underline text-sm"
                    target="_blank"
                  >
                    LinkedIn
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
