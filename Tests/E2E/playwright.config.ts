import {defineConfig, devices} from "@playwright/test";
import {defineBddConfig} from "playwright-bdd";

// Extension point: To run with other Configurations (default is Production/E2E-SUT)
const {FLOW_CONTEXT, REUSE_EXISTING_SUT} = process.env;

const testDir = defineBddConfig({
    features: "features/**/*.feature",
    steps: "steps/**/*.ts",
});

export default defineConfig({
    testDir,
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    timeout: 60_000,
    expect: {
        timeout: 30_000
    },
    forbidOnly: Boolean(process.env.CI),
    reporter: process.env.CI
        ? [['html', {open: 'never'}], ['json', {outputFile: 'playwright-report/results.json'}]]
        : [['html', {open: 'on-failure'}], ['list']],
    use: {
        baseURL: "http://localhost:8081",
        actionTimeout: 10_000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry'
    },
    globalTeardown: "./global-teardown.ts",
    webServer: {
        command: `echo "starting system under test with context ${FLOW_CONTEXT}"; FLOW_CONTEXT=${FLOW_CONTEXT} docker compose -f ./system_under_test/docker-compose.yaml up --build`,
        url: "http://localhost:8081/",
        reuseExistingServer: Boolean(REUSE_EXISTING_SUT),
        timeout: 600_000,
        stdout: "pipe",
        stderr: "pipe",
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 800}}
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox']}
        },
        {
            name: 'webkit',
            use: {...devices['Desktop Safari']},
        }
    ],
});
