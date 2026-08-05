import test from "node:test"
import assert from "node:assert/strict"
import { parseDiagramRoles } from "@/helpers/parseDiagramRoles"
import { applyDiagramTheme } from "@/helpers/applyDiagramTheme"

test("reads one role per node from a comma list", () => {
  const roles = parseDiagramRoles(`flowchart TD
    A[Pomiar] --> B[Osluchanie]
    class A,B czynnosc
    class C decyzja`)

  assert.equal(roles.get("A"), "czynnosc")
  assert.equal(roles.get("B"), "czynnosc")
  assert.equal(roles.get("C"), "decyzja")
})

test("reads the inline role shorthand", () => {
  const roles = parseDiagramRoles(`flowchart TD
    A[Pomiar]:::czynnosc --> B{Pytanie?}:::decyzja`)

  assert.equal(roles.get("A"), "czynnosc")
  assert.equal(roles.get("B"), "decyzja")
})

test("ignores a class that names no known role", () => {
  const roles = parseDiagramRoles(`flowchart TD
    A[Pomiar]
    class A wymyslona`)

  assert.equal(roles.has("A"), false)
})

test("picks up the group role the theme pass adds", () => {
  const roles = parseDiagramRoles(
    applyDiagramTheme(`flowchart TD
    subgraph Ocena["Ocena wstepna"]
      A[Pomiar]
    end
    class A czynnosc`)
  )

  assert.equal(roles.get("Ocena"), "grupa")
  assert.equal(roles.get("A"), "czynnosc")
})
