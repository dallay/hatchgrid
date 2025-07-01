# Performance Testing with Gatling

This document outlines how to run and manage performance tests using Gatling for the Hatchgrid Thryve server.

## Prerequisites

1.  **Java Development Kit (JDK):** Ensure you have JDK 17 or later installed.
2.  **Docker (for running local server):** The application server uses Testcontainers for some tests, and Gatling tests will run against a running server. Ensure Docker is running if you intend to run `./gradlew test` or if your local server setup relies on Docker (e.g. via `spring-boot-docker-compose`).
3.  **Running Application:** The Hatchgrid Thryve server must be running locally for Gatling tests to target. You can typically start it using:
    ```bash
    ./gradlew :server:thryve:bootRun
    ```
    Ensure the server is accessible at `http://localhost:8080`.

## Implemented Simulations

The following simulations are located in `server/thryve/src/gatling/kotlin/com/hatchgrid/thryve/simulation/`:

*   `BasicSimulation.kt`: Checks the health endpoint (`/actuator/health`).
*   `UserLoginSimulation.kt`: Tests user login using data from `users.csv`.
*   `WorkspaceSimulation.kt`: Simulates workspace creation and retrieval. Uses `token.csv` for auth tokens.
*   `NewsletterSimulation.kt`: Simulates newsletter creation and retrieval. Uses `token.csv` and `workspace_ids.csv`.
*   `SubscriberSimulation.kt`: Simulates subscriber management. Uses `token.csv`, `workspace_ids.csv`, `newsletter_ids.csv`, and `subscribers.csv`.

## Feeder Data (CSV Files)

Due to a Kotlin interoperability issue with Gatling's `feeder(Map)` DSL method, all simulations requiring dynamic data injection use CSV feeders. These files are located in `server/thryve/src/gatling/resources/`:

*   `users.csv`: For `UserLoginSimulation`. Format: `username,password`
*   `token.csv`: For simulations requiring authentication. Format: `token` (e.g., `Bearer <YOUR_TOKEN>`)
*   `workspace_ids.csv`: For workspace-specific actions. Format: `workspaceId`
*   `newsletter_ids.csv`: For newsletter-specific actions. Format: `newsletterId`
*   `subscribers.csv`: For `SubscriberSimulation`. Format: `email`

**Important:** For simulations requiring authentication tokens or specific IDs (`token.csv`, `workspace_ids.csv`, `newsletter_ids.csv`), you **must** populate these CSV files with valid data from your target environment before running the simulations. For example, obtain a valid JWT token after logging in and place it in `token.csv`. Similarly, provide existing workspace/newsletter IDs if the simulation expects them.

## Running Simulations

### Running a Specific Simulation

You can run a specific simulation using the `gatlingRun` task followed by the fully qualified name of the simulation class.

Example:
```bash
./gradlew :server:thryve:gatlingRun-com.hatchgrid.thryve.simulation.BasicSimulation
```
Replace `BasicSimulation` with the desired simulation name (e.g., `UserLoginSimulation`, `WorkspaceSimulation`, etc.).

### Running All Simulations

There are two primary ways to run all simulations:

1.  **Using the default Gatling task (`gatlingRun`):**
    This task discovers and runs all simulation classes it finds in the Gatling source directory.
    ```bash
    ./gradlew :server:thryve:gatlingRun
    ```

2.  **Using the custom aggregate task (`allGatlingSimulations`):**
    A specific aggregate task has been configured to explicitly run all five core simulations:
    ```bash
    ./gradlew :server:thryve:allGatlingSimulations
    ```
    This task provides a clear, explicit way to run the entire defined suite of performance tests.

## Viewing Reports

Gatling generates HTML reports in `server/thryve/build/reports/gatling/`. Each run creates a timestamped subdirectory. Open `index.html` within that directory to view results.

Example (macOS):
```bash
open server/thryve/build/reports/gatling/<SIMULATION_NAME>-<TIMESTAMP>/index.html
```

## Customizing Simulations

*   **User Load:** Adjust `setUp()` methods in simulation files (e.g., `atOnceUsers`, `rampUsers`) for load profiles.
*   **Endpoints/Payloads:** Modify HTTP requests in `.exec()` blocks.
*   **Feeder Data:** Update content in the respective CSV files in `server/thryve/src/gatling/resources/`.

## Future Considerations

*   **CI Automation:** Integrate `gatlingRun` into CI.
*   **Report Artifacts:** Save Gatling reports as CI artifacts.
*   **Dynamic Data Fetching:** For a more robust solution, consider modifying simulations to dynamically fetch tokens/IDs (e.g., from a login step within the simulation or environment variables) rather than relying solely on manually edited CSV files.
```
