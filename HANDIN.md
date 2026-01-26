# Git Homework – Team Workflow with Git & GitHub

## Part 1: Repository setup

### Step 1: Fork the repository
- Forkisin algse repo oma GitHubi alla: `https://github.com/raigoh/vanemarendaja-borsibaar`
- Meie tiimi “main” repo (team repository) on: `https://github.com/taltech-vanemarendajaks/Borsibaar-team19`
- Originaal (course) repo: `https://github.com/taltech-coding/vanemarendaja-borsibaar`

### Step 2: Clone the repository
- Kloonsin tiimi repo lokaalselt (kõik edasised Git tegevused tegin käsurealt).
- Remotes:
  - `origin` → `https://github.com/taltech-vanemarendajaks/Borsibaar-team19.git`
  - `fork` → `https://github.com/raigoh/vanemarendaja-borsibaar.git`
  - `taltech` → `https://github.com/taltech-coding/vanemarendaja-borsibaar.git`

### Step 3: Initial commit (TEAM.md)
- Lõin uue branchi: `docs/add-team-md`
- Lõin faili: `TEAM.md`
- Commitisin ja pushisin branchi `origin`-isse:
  - Commit: `7228b69` — `docs: add TEAM.md with team information and workflow`
  - Remote branch: `origin/docs/add-team-md`
- Tegin GitHubis Pull Requesti ja merge’isin selle `main` branchi:
  - PR: `#52` — `docs: add TEAM.md with team information and workflow`
  - Review: `VuntsJaHabe` (approval)
  - Merge commit (main): `3daf1d9`

## Part 2: Branching and parallel development

### Step 4: Define features
Valisin iseseisva feature’i, mida saan paralleelselt arendada eraldi harus.

### Step 5–6: Create feature branches & work on features (tõendid)

#### Feature 1 (minu tehtud): Inventory frontend refactor / type improvements
- Tegija: `raigoh`
- Branch: `refactor/inventory-management-improvements`
- Remote branch: `origin/refactor/inventory-management-improvements`
- Lühikirjeldus: parendasin inventory vaate TypeScript tüüpe ja lihtsustasin loogikat (InventoryTable + hooks + types).
- Mõjutatud failid (näited):
  - `frontend/app/(protected)/(sidebar)/inventory/components/InventoryTable.tsx`
- Mitu commit’i (tõend):
  - `027fb91` — `feat(inventory): add type annotations to useInventoryTransactions hook`
  - `c59b17c` — `feat(inventory): add ProductRequestDto type annotations to useInventoryActions`
  - `dcdf31a` — `feat(inventory): add stock request DTO type annotations to useInventoryActions`
  - `6529fb6` — `feat(inventory): add CategoryRequestDto type annotations to useInventoryActions`
  - `67e6cef` — `refactor(inventory): use number types directly in InventoryTable`
  - `ba4d0ef` — `fix(inventory): import DTO types for type aliases in types.ts`
  - `94b0184` — `refactor(inventory): remove unnecessary typeof check for quantity in InventoryTable`

#### Feature 2: TEAM.md lisamine (docs)
- Tegija: `raigoh`
- Branch: `docs/add-team-md`
- Remote branch: `origin/docs/add-team-md`
- Lühikirjeldus: lisasin `TEAM.md` faili (tiimi nimi, liikmed, workflow).
- Mitu commit’i (tõend):
  - `7228b69` — `docs: add TEAM.md with team information and workflow`
  - `3daf1d9` — `Merge pull request #52 from taltech-vanemarendajaks/docs/add-team-md`
- PR: `#52` (review: `VuntsJaHabe` — approval)

## Part 3: Creating and resolving conflicts

### Step 7: Intentionally create a conflict
Tekitasin merge konflikti üksi, kasutades 2 juba olemasolevat branchi (`docs/add-team-md` ja `refactor/inventory-management-improvements`), kus muutsin `README.md` sama rida (“Project Overview” kirjelduses) erinevalt.

- Branch A: `docs/add-team-md`
  - Commit: `c242eb5` — `docs(readme): updated overview text`
- Branch B: `refactor/inventory-management-improvements`
  - Commit: `1582c9d` — `docs(readme): updated overview text`

GitHubis avasin 2 PR-i `main` branchi vastu:
- PR #54: `docs/add-team-md` → `main` (muudatus: "Bärsibaar")
- PR #55: `refactor/inventory-management-improvements` → `main` (muudatus: "Borsibaar")

### Step 8: Resolve the conflict
Merge’isin esimesena PR #55 `main`-i (merge commit), mis sisaldab õiget teksti **"Borsibaar"**. PR #54 jäi konflikti ("has conflicts"). Lahendasin PR #54 konflikti lokaalselt käsurealt, et see ühilduks `main` branchiga (mis nüüd sisaldab PR #55 muudatusi).

- Eesmärk: lõpptulemus `main` branchis on **"Borsibaar"** (PR #55 muudatus).
- Käsud (PR #54 konflikti lahendamiseks):
  - `git checkout docs/add-team-md`
  - `git fetch origin`
  - `git merge origin/main`
  - lahendasin konfliktid `README.md` failis (jätan "Borsibaar", mis on juba main'is PR #55-st)
  - `git add README.md`
  - `git commit -m "resolve: merge conflict in README (keep Borsibaar)"`
  - `git push origin docs/add-team-md`

Tõendid (täidan pärast approve/merge’i):
- Konflikti lahenduse commit: `f5acb59` — `resolve: merge conflict in README (keep Borsibaar)`
- Merge commit `main` branchis (PR #55): `1126e65` — `Merge pull request #55 from taltech-vanemarendajaks/refactor/inventory-management-improvements`
- PR #54 reviewer: `VuntsJaHabe` (approval)
- PR #55 reviewer: `VuntsJaHabe` (approval)

## Part 4: Pull requests and code reviews (in GitHub GUI)

### Step 9: Open pull requests
Avasin Pull Requesti GitHubis: `docs/add-team-md` → `main`.

#### PR #52: TEAM.md lisamine
- Branch: `docs/add-team-md` → `main`
- Avasin PR-i GitHubis pärast seda, kui pushisin `docs/add-team-md` branchi.
- Muutus: uus fail `TEAM.md` (+43 rida) — tiimi nimi, liikmed, workflow kirjeldus.

### Step 10: Review pull requests
Tiimi liige tegi review'i ja jättis kommentaari.

#### PR #52 review
- Reviewer: `VuntsJaHabe`
- Review tulemus: **Approved**
- Kommentaar: "Kõik tundub hea - tiimile tuleb anda teada, et nad oma nimed/username-d ka sisse lisaks tulevikus."
- Vastus: ei vastanud kommentaarile
- Täiendavad commitid pärast review’d: ei
- Merge: merge’isin PR-i `main`-i pärast approval’t

## Part 5: Merging strategies (in GitHub GUI)

### Step 11: Use different merge types
Kasutasin erinevaid merge strateegiaid PR-ide merge’imiseks `main` branchi GitHubis.

#### Merge commit
- PR #52: `docs/add-team-md` → `main`
- Merge commit: `3daf1d9` — `Merge pull request #52 from taltech-vanemarendajaks/docs/add-team-md`
- Tulemus: PR-i commitid jäid `main` branchi ajalukku eraldi commitidena + merge commit.

#### Squash merge
- PR #54: `docs/add-team-md` → `main`
- Commit: `1412acb` — `docs(readme): updated overview text (#54)`
- Tulemus: PR-i commitid ühendatakse üheks commit’iks `main` branchis.

### Step 12: Explain your choices

#### Merge commit (PR #52)
Valisin merge commit strateegia, kuna:
- Säilitab täieliku PR-i ajaloo — näha on kõik individuaalsed commitid ja merge commit
- Lihtne tagasi võtta — saab revert’ida terve merge commit’i korraga
- Selge ajalugu — näha on, millal ja kuidas PR merge’iti

#### Squash merge (PR #54)
Valisin squash merge strateegia, kuna:
- Lihtsustab `main` branchi ajalugu — üks selge commit PR-i kohta
- Sobib väikeste muudatuste jaoks — PR-i sisu on üks loogiline muutus
- Puhas ajalugu — vähem commit’e `main` branchis

#### Probleemid
Probleeme merge strateegiatega pole olnud.

## Part 6: Final cleanup

### Step 13: Repository hygiene

