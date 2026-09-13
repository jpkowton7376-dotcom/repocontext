"use client"

import { useParams } from "next/navigation"
import { ProjectDetail } from "./ProjectDetail"

export default function WorkshopProjectPage() {
  const params = useParams<{ slug: string }>()
  return <ProjectDetail slug={params.slug} />
}
