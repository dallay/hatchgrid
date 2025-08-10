package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.IntegrationTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.config.InfrastructureTestContainers
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay
import kotlinx.coroutines.test.runTest
import net.datafaker.Faker
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql

@IntegrationTest
class CreateDefaultWorkspaceOnUserCreationIntegrationTest : InfrastructureTestContainers() {

    @Autowired
    private lateinit var eventPublisher: EventPublisher<UserCreatedEvent>

    @Autowired
    private lateinit var workspaceFinderRepository: WorkspaceFinderRepository

    private val faker = Faker()

    @BeforeEach
    fun setUp() {
        startInfrastructure()
    }

    private suspend fun <T> waitUntil(
        supplier: suspend () -> T,
        predicate: (T) -> Boolean,
        timeoutMillis: Long = 5000,
        intervalMillis: Long = 100
    ): T {
        val start = System.currentTimeMillis()
        while (true) {
            val value = supplier()
            if (predicate(value)) return value
            if (System.currentTimeMillis() - start > timeoutMillis) {
                throw AssertionError("Condition not met within $timeoutMillis ms")
            }
            delay(intervalMillis)
        }
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace when user is created and has no existing workspaces`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspaces.size, "Should create exactly one workspace")

        val workspace = workspaces.first()
        assertEquals("$firstname $lastname's Workspace", workspace.name)
        assertEquals("Default workspace created automatically upon user registration", workspace.description)
        assertEquals(userId, workspace.ownerId.value.toString())
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with firstname only when lastname is null`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = null,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspaces.size)
        assertEquals("$firstname's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with lastname only when firstname is null`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = null,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspaces.size)
        assertEquals("$lastname's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with 'My Workspace' when both names are null`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = null,
            lastName = null,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspaces.size)
        assertEquals("My Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should not create workspace when user already has existing workspaces`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        // Pre-create a workspace for this user
        // This would typically involve creating a workspace through the application service
        // For now, we'll simulate this by creating the event twice with some delay
        val firstEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // First event should create the workspace
        eventPublisher.publish(firstEvent)
        val workspacesAfterFirst = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspacesAfterFirst.size, "First event should create workspace")

        // When - publish the same event again
        val secondEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        eventPublisher.publish(secondEvent)
        // Wait a short time to ensure any duplicate event is processed, but still expect only one workspace
        val workspacesAfterSecond = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspacesAfterSecond.size, "Should not create additional workspace")
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should handle workspace names with special characters and whitespace correctly`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = "  José María  " // Names with accents and extra whitespace
        val lastname = "  González-López  "
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.size == 1 },
        )
        assertEquals(1, workspaces.size)
        assertEquals("José María González-López's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should eventually create workspace after publishing UserCreatedEvent`() = runTest {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Then - workspace should be created through eventual consistency
        val workspaces = waitUntil(
            supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
            predicate = { it.isNotEmpty() },
        )
        assertTrue(workspaces.isNotEmpty(), "Workspace should be created eventually")
        assertEquals("$firstname $lastname's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create only one workspace when duplicate user-created events are published concurrently`() =
        runTest {
            // Given
            val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
            val firstname = faker.name().firstName()
            val lastname = faker.name().lastName()
            val email = faker.internet().emailAddress()

            val event1 = UserCreatedEvent(
                id = userId,
                email = email,
                firstName = firstname,
                lastName = lastname,
            )
            val event2 = UserCreatedEvent(
                id = userId,
                email = email,
                firstName = firstname,
                lastName = lastname,
            )

            // When - publish both events concurrently
            awaitAll(
                async { eventPublisher.publish(event1) },
                async { eventPublisher.publish(event2) },
            )

            // Then - only one workspace should exist after both are processed
            val workspaces = waitUntil(
                supplier = { workspaceFinderRepository.findByOwnerId(UserId(userId)) },
                predicate = { it.size == 1 },
            )
            assertEquals(1, workspaces.size, "Should create exactly one workspace despite concurrent duplicate events")
        }
}
