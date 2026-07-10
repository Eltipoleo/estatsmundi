import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../lib/api"

type UserDoc = {
  uid: string
  name: string
  email: string
  role: "usuario" | "administrador"
  emailVerified: boolean
}

export default function Admin() {
  const { user } = useAuth()
  const [usersList, setUsersList] = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "administrador") return

    async function loadUsers() {
      try {
        const res = await apiFetch<{ success: boolean; data: UserDoc[] }>("/api/users")
        if (res?.data) {
          setUsersList(res.data)
        }
      } catch (err: any) {
        console.error(err)
        setError("No se pudieron cargar los usuarios de MongoDB o no tienes permisos.")
      } finally {
        setLoading(false)
      }
    }

    void loadUsers()
  }, [user])

  if (!user || user.role !== "administrador") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
        Acceso denegado. Se requieren permisos de administrador.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">Gestión de usuarios y control de roles del sistema.</p>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando lista de usuarios...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo electrónico</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usersList.map((u) => (
                <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        u.role === "administrador"
                          ? "bg-primary/10 text-primary ring-primary/30"
                          : "bg-muted text-muted-foreground ring-muted-foreground/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {u.emailVerified ? "✓ Verificado" : "Pendiente"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}