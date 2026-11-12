# Contributing to WildArc

First off, thank you for considering contributing to WildArc! It's people like you that make WildArc an incredible platform for regenerative permaculture.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### 🪲 Reporting Bugs
If you find a bug, please create an issue using the Bug Report template. Include details like:
- Your OS and browser
- Steps to reproduce
- Expected behavior vs actual behavior
- Screenshots if applicable

### 💡 Suggesting Enhancements
Have an idea for a new feature? 
1. Check existing issues to see if it's already been suggested.
2. If not, create a new issue using the Feature Request template.
3. Be as specific as possible about the *problem* this feature solves.

### 💻 Contributing Code

#### 1. Development Setup

Use Node 26 (`nvm use` reads `.nvmrc`). Most work happens in the phone version, which needs no server, no
database and no accounts:

```bash
git clone https://github.com/your-username/wildarc-arbor.git
cd wildarc-arbor/frontend
npm ci
npm run dev
```

Open the address Vite prints, then "Look around the sample farm" to get data to work with. Before a pull
request, run in `frontend/`:

```bash
npx tsc --noEmit
npx vitest run
```

Only for changes to the API or the database: the server version runs the same screens against the Express
API and Supabase. See "Server version" in the README.

#### 2. Branch Naming
Create branches off the `main` branch.
- Feature: `feature/module-name-description` (e.g. `feature/arbor-yield-tracking`)
- Bugfix: `fix/module-name-description` (e.g. `fix/core-auth-token`)
- Docs: `docs/description`

#### 3. Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(module): description`
- `fix(module): description`
- `docs(module): description`
- `chore: description`

#### 4. Pull Requests
- Open your PR against the `main` branch.
- Follow the PR template checklist.
- Keep PRs focused on a single change.
- Link the PR to the issue it resolves (e.g. "Closes #42").

## Code Style
- **TypeScript Strict Mode** is enabled. Do not use `any` unless absolutely necessary.
- There is no lint script yet. Before committing, run `npx tsc --noEmit` and the tests in each part you changed (the repository root and `frontend/`).
- Follow the modular structure conventions (see [Project Structure](https://github.com/yozo06/tms/blob/main/docs/vision/06_PROJECT_STRUCTURE.md) in the WildArc vision docs).

Thank you for helping us build the future of open-source agriculture! 🌱
