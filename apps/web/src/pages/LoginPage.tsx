import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth/AuthProvider";
import { demoCredentials } from "@/services/api/authRepository";

const LoginPage = () => {
  const { isCustomerAuthenticated, loginCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (isCustomerAuthenticated) {
    return <Navigate to="/minha-conta" replace />;
  }

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/minha-conta";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginCustomer({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha no login de cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Login do Cliente
          </CardTitle>
          <CardDescription>Acesse sua área para acompanhar pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-email">E-mail</Label>
              <Input
                id="customer-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">Senha</Label>
              <Input
                id="customer-password"
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
              <LogIn className="w-4 h-4 mr-2" /> Entrar
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            Demo: {demoCredentials.customer.email} / {demoCredentials.customer.password}
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            Acesso administrativo? <Link className="text-primary underline" to="/admin/login">Entrar como admin</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

