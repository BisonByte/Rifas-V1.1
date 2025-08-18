'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface DbConfig { url: string }
interface AdminConfig { email: string; password: string }
interface SecretsConfig { jwtSecret: string }
interface ModulesConfig { payments: boolean }
interface SetupState {
  db?: DbConfig
  admin?: AdminConfig
  secrets?: SecretsConfig
  modules?: ModulesConfig
}

const steps = ['Base de datos', 'Administrador', 'Secretos', 'Módulos opcionales', 'Resumen']

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<SetupState>({})
  const router = useRouter()

  useEffect(() => {
    fetch('/api/setup/state').then(res => res.json()).then(data => {
      setState(data)
    })
  }, [])

  const save = async (partial: Partial<SetupState>) => {
    const newState = { ...state, ...partial }
    setState(newState)
    await fetch('/api/setup/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial)
    })
  }

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleDbSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const dbUrl = formData.get('dbUrl')?.toString() || ''
    await save({ db: { url: dbUrl } })
    next()
  }

  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')?.toString() || ''
    const password = formData.get('password')?.toString() || ''
    await save({ admin: { email, password } })
    next()
  }

  const handleSecretsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const jwtSecret = formData.get('jwtSecret')?.toString() || ''
    await save({ secrets: { jwtSecret } })
    next()
  }

  const handleModulesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payments = formData.get('payments') === 'on'
    await save({ modules: { payments } })
    next()
  }

  const testConnection = async () => {
    const res = await fetch('/api/setup/db-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.db)
    })
    const data = await res.json()
    alert(data.ok ? 'Conexión exitosa' : data.error || 'Error')
  }

  const apply = async () => {
    const res = await fetch('/api/setup/apply', { method: 'POST' })
    if (res.ok) {
      router.push('/')
    }
  }

  return (
    <div className='max-w-xl mx-auto p-6 space-y-6'>
      <ol className='flex space-x-4'>
        {steps.map((name, i) => (
          <li key={name} className={i === step ? 'font-bold' : 'text-gray-500'}>
            {name}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form onSubmit={handleDbSubmit} className='space-y-4'>
          <Input name='dbUrl' placeholder='URL de la base de datos' defaultValue={state.db?.url || ''} />
          <div className='flex gap-2'>
            <Button type='button' onClick={testConnection}>
              Probar conexión
            </Button>
            <Button type='submit'>Guardar y continuar</Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleAdminSubmit} className='space-y-4'>
          <Input name='email' type='email' placeholder='Email del administrador' defaultValue={state.admin?.email || ''} />
          <Input name='password' type='password' placeholder='Contraseña' defaultValue={state.admin?.password || ''} />
          <div className='flex gap-2'>
            <Button type='button' onClick={prev}>
              Atrás
            </Button>
            <Button type='submit'>Guardar y continuar</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSecretsSubmit} className='space-y-4'>
          <Input name='jwtSecret' placeholder='JWT Secret' defaultValue={state.secrets?.jwtSecret || ''} />
          <div className='flex gap-2'>
            <Button type='button' onClick={prev}>
              Atrás
            </Button>
            <Button type='submit'>Guardar y continuar</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleModulesSubmit} className='space-y-4'>
          <label className='flex items-center space-x-2'>
            <input type='checkbox' name='payments' defaultChecked={state.modules?.payments} />
            <span>Activar módulo de pagos</span>
          </label>
          <div className='flex gap-2'>
            <Button type='button' onClick={prev}>
              Atrás
            </Button>
            <Button type='submit'>Guardar y continuar</Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className='space-y-4'>
          <pre className='bg-gray-800 p-4 rounded text-xs overflow-x-auto'>{JSON.stringify(state, null, 2)}</pre>
          <div className='flex gap-2'>
            <Button type='button' onClick={prev}>
              Atrás
            </Button>
            <Button onClick={apply}>Confirmar y aplicar</Button>
          </div>
        </div>
      )}
    </div>
  )
}

