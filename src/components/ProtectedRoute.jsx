import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, permission, children }) {
  // Admin يرى كل شيء
  if (user?.role === 'admin') return children;

  // إذا لم تكن هناك صلاحية مطلوبة، اسمح
  if (!permission) return children;

  // إذا كان المستخدم يملك الصلاحية، اسمح
  const permissions = user?.permissions || [];
  if (permissions.includes(permission)) return children;

  // وإلا، أعِد التوجيه للرئيسية
  return <Navigate to="/" replace />;
}
