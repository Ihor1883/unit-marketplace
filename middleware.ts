import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Закрываем всё, что начинается с /admin, кроме самой страницы входа
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const adminAuth = request.cookies.get('admin_token');
    
    // Секретный пароль можно хранить здесь или в Vercel Environment Variables
    if (adminAuth?.value !== 'SUPER_SECRET_KEY_123') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next();
}