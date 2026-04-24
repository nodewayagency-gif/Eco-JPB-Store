import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth/AuthProvider";
import { demoCredentials } from "@/services/api/authRepository";

const AdminLoginPage = () => {
  const { isAdminAuthenticated, loginAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha no login administrativo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Login Administrativo
          </CardTitle>
          <CardDescription>Área restrita para admin e operador.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">E-mail</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              <LogIn className="w-4 h-4 mr-2" /> Entrar no painel
            </Button>
          </form>

          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <p>Admin demo: {demoCredentials.admin.email} / {demoCredentials.admin.password}</p>
            <p>Operador demo: {demoCredentials.operator.email} / {demoCredentials.operator.password}</p>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Área do cliente? <Link className="text-primary underline" to="/login">Entrar como cliente</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;

