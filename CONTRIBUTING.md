# Contributing

Thanks for taking the time to contribute! This guide explains how to get the project running locally, how we test changes, and the commit/PR conventions we follow.

## Development workflow

1. **Fork and clone the repo**
   ```bash
   git clone https://github.com/knoksen/ebike-assistant-app.git
   cd ebike-assistant-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app locally**
   ```bash
   npm run dev
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feat/short-description
   ```

5. **Make changes and keep docs/tests updated**
   - Update any relevant docs under `DEVELOPMENT.md`, `TESTING.md`, or the README.
   - Add or update tests when modifying logic or UI components.

6. **Open a pull request**
   - Fill out the PR template.
   - Include screenshots for UI changes when possible.

## Testing

Frontend tests (Vitest):
```bash
npm test
npm run test:watch
npm run test:coverage
```

Linting:
```bash
npm run lint
```

Android tests:
```bash
./gradlew test
./gradlew connectedAndroidTest
```

More detail is available in [`TESTING.md`](TESTING.md).

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) to keep the history readable and automate release notes.

**Format:**
```
<type>(<scope>): <summary>
```

**Common types:**
- `feat`: new functionality
- `fix`: bug fixes
- `docs`: documentation-only changes
- `chore`: tooling or maintenance work
- `refactor`: refactors without behavior changes
- `test`: adding or improving tests

**Examples:**
- `feat(bluetooth): add reconnect retry logic`
- `fix(ui): handle empty diagnostics list`
- `docs: clarify Android test setup`

## Pull request checklist

- [ ] Tests and lint pass (`npm run lint`, `npm test`)
- [ ] Documentation updated if needed
- [ ] Screenshots added for UI changes
- [ ] Conventional commit message used
