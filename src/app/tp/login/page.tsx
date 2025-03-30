import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 px-4">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </div>
  )
} 