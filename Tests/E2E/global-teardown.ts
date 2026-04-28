import {execSync} from "node:child_process";
import {dirname} from "node:path";

// TODO: if Reusing SUT -> only reset (discard all, etc)
const {REUSE_EXISTING_SUT} = process.env;

export default async function globalTeardown() {
    if (REUSE_EXISTING_SUT !== '1') {
        execSync("docker compose -f ./system_under_test/docker-compose.yaml down", {
            stdio: "inherit",
            cwd: dirname("."),
        });
        execSync('docker volume rm neos_ui_e2e_db_neos_data', {
            stdio: "inherit",
            cwd: dirname(".")
        });
    }
}
