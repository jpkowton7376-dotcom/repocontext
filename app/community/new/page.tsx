"use client"

import { SiteNav } from "@/components/SiteNav"
import { NewProjectForm } from "./NewProjectForm"

export default function NewProjectPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <SiteNav variant="light" />
      <NewProjectForm />
    </main>
  )
}
