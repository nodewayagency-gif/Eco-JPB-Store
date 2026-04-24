import { loginWithGoogle } from "./actions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <main className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1a1a20 0%, #0b0b0d 100%)' }}>
      <div className="container" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="panel" style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(20, 20, 24, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div className="stack-md">
            <h1 className="brand" style={{ fontSize: '2rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
              JPB Store
            </h1>
            <p className="muted" style={{ marginBottom: '2rem' }}>
              Acesse sua conta para gerenciar seus pedidos e preferências.
            </p>
            
            <form action={loginWithGoogle}>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h7"/>
                </svg>
                Entrar com Google
              </button>
            </form>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem' }}>
              <p className="muted">
                Ao entrar, você concorda com nossos <br />
                <a href="/termos" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Termos de Serviço</a>.
              </p>
            </div>
          </div>
        </div>
        
        <p className="muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} JPB Store Hub Eletrônico.
        </p>
      </div>
      
      <style jsx>{`
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px var(--primary-alpha);
        }
        .btn-primary:active {
          transform: translateY(0);
        }
      `}</style>
    </main>
  )
}
