// The AI Literacy course: everything the platform reads about it.
// Platform code imports course data only from "@course" (this file), course
// screens from "@course/ui", and the protected question bank from
// "@course/assessments" (server code only). See courses/README.md.
export * from "./content/modules";
export * from "./content/journey";
export * from "./content/preview-lessons";
export * from "./content/stories";
export * from "./content/explore-guides";
export * from "./content/welcome";
export * from "./content/reflection-examples";
export { stepComplete } from "./activities/completion";
