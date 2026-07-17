/**
 * Quick-start templates for the empty state. Selecting one only PRE-FILLS
 * the New Mission form — nothing is created until the hunter confirms by
 * submitting. Each preset uses the same field names as a mission and a
 * category from CATEGORIES (see data/missions.js).
 */
export const TASK_TEMPLATES = [
  {
    id: "workout",
    label: "Daily Workout",
    icon: "Dumbbell",
    preset: {
      title: "Daily Workout",
      description: "Train the body — a hunter's first weapon.",
      category: "Training",
      difficulty: "C",
      priority: "HIGH",
    },
  },
  {
    id: "study",
    label: "Study Session",
    icon: "BookOpen",
    preset: {
      title: "Study Session",
      description: "Focused study block. Knowledge is mana.",
      category: "Research",
      difficulty: "B",
      priority: "MEDIUM",
    },
  },
  {
    id: "goal",
    label: "Personal Goal",
    icon: "Target",
    preset: {
      title: "Personal Goal",
      description: "A step toward something that matters.",
      category: "Recovery",
      difficulty: "C",
      priority: "MEDIUM",
    },
  },
  {
    id: "work",
    label: "Work Task",
    icon: "Briefcase",
    preset: {
      title: "Work Task",
      description: "Clear a work objective.",
      category: "Guild",
      difficulty: "C",
      priority: "HIGH",
    },
  },
];
