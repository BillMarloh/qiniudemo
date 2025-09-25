import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GenerationWorkspace } from "@/components/generation-workspace"
import { ThreeModelPreview } from "@/components/three-model-preview"
import { ModelLibrary } from "@/components/model-library"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <div id="generation" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GenerationWorkspace />
            <ThreeModelPreview />
          </div>
          <div id="library" className="mt-16">
            <ModelLibrary />
          </div>
        </div>
      </main>
    </div>
  )
}
