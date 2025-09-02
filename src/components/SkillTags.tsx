interface SkillTagsProps {
  skills: string[];
}

export function SkillTags({ skills }: SkillTagsProps) {
  if (skills.length === 0) return null;

  return (
    <section aria-labelledby="skills" className="space-y-4">
      <h2 id="skills" className="text-lg font-semibold">Skills & Expertise</h2>
      
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="skill-pill px-3 py-1.5 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}