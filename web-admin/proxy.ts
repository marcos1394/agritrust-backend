import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Definimos qué rutas son públicas (Login y Registro)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)',
  '/verify(.*)', '/'
]);

export default clerkMiddleware(async (auth, req) => {
  // Si NO es una ruta pública, protegemos el acceso (te manda al login)
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Excluir archivos estáticos y de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas API
    '/(api|trpc)(.*)',
  ],
};