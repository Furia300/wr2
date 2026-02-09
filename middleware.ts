import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas publicas do painel WR2
  const publicWr2Routes = ["/wr2", "/wr2/login", "/wr2/cadastro", "/wr2/setup"];
  const isPublicWr2 = publicWr2Routes.includes(pathname) || pathname.startsWith("/wr2/convite/");
  const isApi = pathname.startsWith("/api/");

  // Redirecionar para login se nao autenticado em rota protegida
  if (!isPublicWr2 && !isApi && pathname.startsWith("/wr2/") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/wr2/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
