# E2E Tests

End-to-end tests for `neos/neos-ui`, using [Playwright](https://playwright.dev)
with [playwright-bdd](https://vitalets.github.io/playwright-bdd/) for Gherkin-style BDD scenarios. Tests run against a
Dockerised Neos instance (the *system under test*, SUT) — no local Neos installation required.

## Prerequisites

- Docker
- Node.js >= 24 (or [nvm](https://github.com/nvm-sh/nvm) — the setup script uses it automatically if available)
- make

## Setup

Run once after cloning:

```bash
cd Tests/E2E
make setup
```

This will:

1. Build the Docker image for the SUT
2. Install npm dependencies
3. Install the Playwright browsers (chromium, firefox, webkit)
4. Generate the Playwright test files from the Gherkin feature files

## Running tests

```bash
# Run all E2E tests (chromium, firefox, webkit)
make test

# Open the interactive Playwright UI (watch mode, time-travel debugger).
# Requires the SUT to be running — see "Container management" below.
make start-sut
make test-ui
```

`make test` starts the Docker SUT automatically before the run and stops it afterwards. The first run may take
a few minutes while Neos sets itself up inside the container (composer install, migrations, content import).
Subsequent runs reuse the cached image and named volume, so they are much faster.

### FLOW_CONTEXT

The npm `test` script sets `FLOW_CONTEXT=Production/E2E-SUT`, which loads the configuration files in
`system_under_test/sut_file_system_overrides/app/Configuration/Production/E2E-SUT/`.

To test a different application configuration (e.g. with or without a feature enabled), add configuration files under
a sub-context such as `Production/E2E-SUT/my-variant/` and add a matching npm script in `package.json` that sets
`FLOW_CONTEXT=Production/E2E-SUT/my-variant`.

## Container management

When you need to inspect a running container or debug a failure:

```bash
# Start the SUT in the background (without running tests)
make start-sut

# Stream container logs
make log-sut

# Open a bash shell inside the running container
make enter-sut

# Stop the containers and delete their volumes
make sut-down
```

## Directory structure

```
Tests/E2E/
├── Makefile
├── README.md                        # this file
├── features/                        # Gherkin feature files (.feature)
│   ├── login.feature
│   └── sidebar-toggle.feature
├── steps/                           # TypeScript step definitions
│   ├── general-login.steps.ts
│   ├── hooks.ts
│   └── sidebar-toggle.steps.ts
├── helpers/
│   ├── general-pages.ts             # Page Object Model classes
│   └── system.ts                    # Docker/Flow CLI utilities
├── playwright.config.ts
├── global-teardown.ts
├── package.json
├── tsconfig.json
└── system_under_test/
    ├── Dockerfile
    ├── docker-compose.yaml
    └── sut_file_system_overrides/   # Neos/PHP/Caddy config mounted into the container
        ├── app/
        │   ├── composer.json
        │   └── Configuration/
        │       ├── Settings.yaml
        │       └── Production/E2E-SUT/
        │           ├── Caches.yaml
        │           └── Settings.yaml
        ├── entrypoint.sh
        └── etc/
            ├── bash.vips-arm64-hotfix.sh
            ├── frankenphp/Caddyfile
            └── ... (php-ini overrides etc.)
```

---

## Writing new tests

Tests are written in two parts: a **feature file** (what to test, in plain language) and a **steps file** (how to do it,
in TypeScript).

### 1. Write a feature file

Create a `.feature` file under `features/`. Organise by feature area:

```gherkin
# features/my-feature.feature
Feature: My feature description

  Background:
    Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
    And I log in with username "admin" and password "password"

  Scenario: Admin can do the thing
    When I navigate to the thing
    Then I should see the expected result
```

### 2. Implement missing steps

Reuse existing steps from `steps/` where possible. If a step doesn't exist yet, add it to a new or existing steps file:

```typescript
// steps/my-feature.steps.ts
import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";

const {Given, When, Then} = createBdd();

When("I navigate to the thing", async ({page}) => {
  await page.goto("/my-path");
});

Then("I should see the expected result", async ({page}) => {
  await expect(page.locator(".my-selector")).toBeVisible();
});
```

Steps are matched by exact string (including `{string}` parameters). A step defined in any file under `steps/` is
available in all feature files.

### 3. Add Page Objects for new pages

If you are testing a new page, add a class to `helpers/general-pages.ts` (or a new helpers file):

```typescript
export class MyFeaturePage {
  constructor(private readonly page: Page) {
  }

  async goto() {
    await this.page.goto("/my-path");
  }

  async clickTheButton() {
    await this.page.locator(".my-button").click();
  }
}
```

### 4. Regenerate test files

playwright-bdd generates Playwright test files from your feature files. After adding or changing feature files run:

```bash
make generate-bdd-files
```

This is done automatically by `make setup` and `make test`, but you can run it manually during development.

### 5. Use Flow CLI in steps

`helpers/system.ts` exposes utilities that run Neos Flow CLI commands inside the Docker container:

```typescript
import {createUser, removeAllUsers} from "../helpers/system";

// Create a Flow user (synchronous — runs docker exec)
createUser("myuser", "password", ["Neos.Neos:Administrator"]);

// Remove all users (used in AfterScenario hooks for cleanup)
removeAllUsers();
```

You can add more Flow CLI wrappers to `system.ts` following the same pattern.

### Cleanup

The `AfterScenario` hook in `steps/hooks.ts` logs out the current browser session and removes all users after every
scenario, keeping tests isolated. If your tests create other persistent data, add cleanup logic there.

## Tips

- You can pass any Playwright CLI flag through the npm script — for example `npm run test -- --grep "Login"` to run
  only matching scenarios, or `npm run test -- --project=chromium` to run a single browser.
- During development, keep the SUT running with `make start-sut` and re-run tests against it with
  `REUSE_EXISTING_SUT=1 npm run test`. This skips the slow Docker bootstrap on every run.
- Use `make test-ui` for the interactive Playwright UI — it gives you watch mode, time-travel debugging, and a
  locator picker, which is invaluable when authoring new tests.
