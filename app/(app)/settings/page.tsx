import { requireUserId } from "@/lib/auth"
import { getOrCreateProfile } from "@/lib/profile"
import { getApiKeyStatuses, getConfiguredProviders } from "@/lib/ai/keys"
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/models"
import { AppTopbar } from "@/components/app/app-topbar"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"
import { DefaultModelSelector } from "@/components/settings/default-model-selector"
import { ProfileForm } from "@/components/settings/profile-form"

export const metadata = { title: "Impostazioni" }

export default async function SettingsPage() {
  const userId = await requireUserId()
  const [profile, statuses, configured] = await Promise.all([
    getOrCreateProfile(),
    getApiKeyStatuses(userId),
    getConfiguredProviders(userId),
  ])

  const defaultProvider: ProviderId = isProviderId(profile.default_provider ?? "")
    ? (profile.default_provider as ProviderId)
    : DEFAULT_PROVIDER

  return (
    <div className="flex min-h-dvh flex-col">
      <AppTopbar />
      <main className="mx-auto w-[min(820px,94%)] flex-1 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Impostazioni</h1>
        <p className="mt-1 text-muted-foreground">
          Gestisci le tue chiavi AI, il modello predefinito e il profilo.
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-muted-foreground">
            Chiavi AI (Bring Your Own Key)
          </h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Le chiavi sono cifrate con AES-256-GCM e non lasciano mai i nostri
            server in chiaro.
          </p>
          <ApiKeysManager statuses={statuses} />
        </section>

        <section className="mt-8">
          <DefaultModelSelector
            defaultProvider={defaultProvider}
            defaultModel={profile.default_model ?? DEFAULT_MODEL}
            configuredProviders={configured}
          />
        </section>

        <section className="mt-8">
          <ProfileForm
            fullName={profile.full_name ?? ""}
            university={profile.university ?? ""}
            degreeProgram={profile.degree_program ?? ""}
          />
        </section>
      </main>
    </div>
  )
}
