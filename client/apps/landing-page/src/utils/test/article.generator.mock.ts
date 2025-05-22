import type Article from "@/models/article/article.model";

export const generateMockArticle = (overrides: Partial<Article> = {}): Article => {
  return {
    id: "mock-article",
    title: "Mock Article",
    description: "This is a mock article.",
    cover: undefined, // Ajustar con ImageMetadata si es necesario
    category: { id: "mock-category", title: "Mock Category Title" }, // Añadida propiedad title
    tags: [{ id: "mock-tag", title: "Mock Tag Title" }], // Añadida propiedad title
    author: {
      id: "mock-author",
      // Se deben completar las demás propiedades requeridas por la interfaz Author
      // o marcarlas como opcionales en la definición de Author.
      // Por ahora, se usa 'as any' para evitar el error, pero esto debe ser corregido.
      email: "mock@example.com",
      avatar: undefined,
      bio: "Mock bio",
      location: "Mock location",
      socials: []
    } as any, // Considerar definir un mock para Author también
    draft: false,
    featured: false,
    date: new Date("2023-01-01T00:00:00.000Z"),
    lastModified: new Date("2023-01-01T00:00:00.000Z"),
    body: "This is the body of the mock article.",
    ...overrides,
  };
};
