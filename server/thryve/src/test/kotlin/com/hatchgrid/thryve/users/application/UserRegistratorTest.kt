package com.hatchgrid.thryve.users.application

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.credential.CredentialException
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.thryve.users.application.register.UserRegistrator
import com.hatchgrid.thryve.users.domain.User
import com.hatchgrid.thryve.users.domain.UserCreator
import com.hatchgrid.thryve.users.domain.UserStoreException
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.*
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
class UserRegistratorTest {
    private val faker = Faker()
    private val email = faker.internet().emailAddress()
    private val password = Credential.generateRandomCredentialPassword()
    private val firstname = faker.name().firstName()
    private val lastname = faker.name().lastName()

    @Nested
    inner class IntegrationTestsWithRealImplementations {
        private val userCreator = InMemoryUserRepository()
        private val eventPublisher = InMemoryEventPublisher<UserCreatedEvent>()
        private val userRegistrator = UserRegistrator(userCreator, eventPublisher)

        @Test
        fun `should register new user successfully and publish events`(): Unit = runBlocking {
            userRegistrator.registerNewUser(
                Email(email), Credential.create(password), FirstName(firstname),
                LastName(lastname),
            )
            val publishedEvents = eventPublisher.getEvents()
            assertFalse(publishedEvents.isEmpty(), "Expected at least one event to be published")
            assertTrue(
                publishedEvents.any {
                    it.javaClass == UserCreatedEvent::class.java
                },
                "Expected UserCreatedEvent to be published",
            )
        }

        @Test
        fun `should throw UserStoreException when trying to register user with existing email`(): Unit =
            runBlocking {
                // Register first user
                userRegistrator.registerNewUser(
                    Email(email), Credential.create(password), FirstName(firstname),
                    LastName(lastname),
                )

                // When & Then - Attempting to register second user with same email should throw exception
                val exception = assertThrows<UserStoreException> {
                    userRegistrator.registerNewUser(
                        Email(email), Credential.create(password), FirstName("Another"),
                        LastName("User"),
                    )
                }
                assertTrue(
                    exception.message.contains("already exists"),
                    "Exception message should indicate user already exists",
                )
            }

        @Test
        fun `should throw CredentialException when password does not meet complexity requirements`(): Unit =
            runBlocking {
                // Given
                val weakPassword = "weak" // This will fail Credential validation

                // When & Then
                assertThrows<CredentialException> {
                    User.create(
                        UUID.randomUUID().toString(),
                        email,
                        firstname,
                        lastname,
                        weakPassword,
                    )
                }
            }

        @Test
        fun `should register multiple users with different emails successfully`(): Unit =
            runBlocking {
                userRegistrator.registerNewUser(
                    Email(faker.internet().emailAddress()),
                    Credential.create(Credential.generateRandomCredentialPassword()),
                    FirstName("John"),
                    LastName("Doe"),
                )
                userRegistrator.registerNewUser(
                    Email(faker.internet().emailAddress()),
                    Credential.create(Credential.generateRandomCredentialPassword()),
                    FirstName("Jane"),
                    LastName("Smith"),
                )
                userRegistrator.registerNewUser(
                    Email(faker.internet().emailAddress()),
                    Credential.create(Credential.generateRandomCredentialPassword()),
                    FirstName("Bob"),
                    LastName("Johnson"),
                )

                // Then - All users should be registered and events published
                val publishedEvents = eventPublisher.getEvents()
                assertTrue(
                    publishedEvents.size >= 3,
                    "Expected at least 3 events to be published for 3 users",
                )
            }
    }

    @Nested
    inner class UnitTestsWithMockedDependencies {
        private val userCreator: UserCreator = mockk()
        private val eventPublisher = InMemoryEventPublisher<UserCreatedEvent>()
        private val userRegistrator = UserRegistrator(userCreator, eventPublisher)

        private lateinit var testUser: User

        @BeforeEach
        fun setUp() {
            testUser =
                User.create(UUID.randomUUID().toString(), email, firstname, lastname, password)
        }

        @Test
        fun `should create user and publish domain events when registration succeeds`(): Unit =
            runBlocking {
                // Given
                val mockCreatedUser: User = mockk()
                val userCreatedEvent: UserCreatedEvent = mockk()

                // Create objects once and reuse them to ensure the same instances are used
                val emailObj = Email(testUser.email.value)
                val credentialObj = Credential.create(password)
                val firstNameObj = FirstName(testUser.name?.firstName?.value ?: "")
                val lastNameObj = LastName(testUser.name?.lastName?.value ?: "")

                coEvery {
                    userCreator.create(
                        email = emailObj,
                        credential = credentialObj,
                        firstName = firstNameObj,
                        lastName = lastNameObj,
                    )
                } returns mockCreatedUser
                every { mockCreatedUser.pullDomainEvents() } returns listOf(userCreatedEvent)

                // When
                userRegistrator.registerNewUser(
                    email = emailObj,
                    credential = credentialObj,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )

                // Then
                coVerify(exactly = 1) {
                    userCreator.create(
                        email = emailObj,
                        credential = credentialObj,
                        firstName = firstNameObj,
                        lastName = lastNameObj,
                    )
                }
                verify(exactly = 1) { mockCreatedUser.pullDomainEvents() }

                val publishedEvents = eventPublisher.getEvents()
                assertEquals(1, publishedEvents.size, "Expected exactly 1 event to be published")
                assertEquals(
                    userCreatedEvent,
                    publishedEvents[0],
                    "Expected UserCreatedEvent to be published",
                )
            }

        @Test
        fun `should propagate UserStoreException when user creation fails`(): Unit = runBlocking {
            // Given
            val errorMessage = "User with email: $email already exists"

            // Create objects once and reuse them to ensure the same instances are used
            val emailObj = Email(testUser.email.value)
            val credentialObj = Credential.create(password)
            val firstNameObj = FirstName(testUser.name?.firstName?.value ?: "")
            val lastNameObj = LastName(testUser.name?.lastName?.value ?: "")

            coEvery {
                userCreator.create(
                    email = emailObj,
                    credential = credentialObj,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )
            } throws UserStoreException(errorMessage)

            // When & Then
            val exception = assertThrows<UserStoreException> {
                userRegistrator.registerNewUser(
                    email = emailObj,
                    credential = credentialObj,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )
            }

            assertEquals(errorMessage, exception.message, "Exception message should match")
            coVerify(exactly = 1) {
                userCreator.create(
                    email = emailObj,
                    credential = credentialObj,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )
            }

            // No events should be published on failure
            val publishedEvents = eventPublisher.getEvents()
            assertTrue(publishedEvents.isEmpty(), "No events should be published on failure")
        }
    }

    @Nested
    inner class EdgeCasesAndBoundaryTests {
        private val userCreator = InMemoryUserRepository()
        private val eventPublisher = InMemoryEventPublisher<UserCreatedEvent>()
        private val userRegistrator = UserRegistrator(userCreator, eventPublisher)

        @Test
        fun `should handle user with minimal valid data`(): Unit = runBlocking {
            // Given
            val minimalUser = User.create(
                id = UUID.randomUUID().toString(),
                email = "a@b.co", // Minimal valid email
                firstName = "A", // Single character
                lastName = "B", // Single character
                password = Credential.generateRandomCredentialPassword(), // Valid complex password
            )

            // When
            userRegistrator.registerNewUser(
                email = Email(minimalUser.email.value),
                credential = Credential.create(minimalUser.credentials.first().value),
                firstName = FirstName(minimalUser.name?.firstName?.value ?: ""),
                lastName = LastName(minimalUser.name?.lastName?.value ?: ""),
            )

            // Then - Should succeed without throwing exception
            val publishedEvents = eventPublisher.getEvents()
            assertFalse(publishedEvents.isEmpty(), "Expected at least one event to be published")
        }

        @Test
        fun `should handle user with maximum length data`(): Unit = runBlocking {
            // Given - Create realistic but long data that won't exceed validation limits
            val longFirstName = "A".repeat(50) // More reasonable length
            val longLastName = "B".repeat(50) // More reasonable length
            val maximalUser = User.create(
                id = UUID.randomUUID().toString(),
                email = "test@long-domain-name.com", // Valid but longer email
                firstName = longFirstName,
                lastName = longLastName,
                password = Credential.generateRandomCredentialPassword(),
            )

            // When
            userRegistrator.registerNewUser(
                email = Email(maximalUser.email.value),
                credential = Credential.create(maximalUser.credentials.first().value),
                firstName = FirstName(maximalUser.name?.firstName?.value ?: ""),
                lastName = LastName(maximalUser.name?.lastName?.value ?: ""),
            )

            // Then - Should succeed without throwing exception
            val publishedEvents = eventPublisher.getEvents()
            assertTrue(publishedEvents.isNotEmpty(), "Expected at least one event to be published")
            assertTrue(
                publishedEvents.any {
                    it.javaClass == UserCreatedEvent::class.java
                },
                "Expected UserCreatedEvent to be published",
            )
        }

        @Test
        fun `should handle special characters in user data`(): Unit = runBlocking {
            // Given
            val specialCharsUser = User.create(
                id = UUID.randomUUID().toString(),
                email = "test+tag@example-domain.co.uk",
                firstName = "José-María",
                lastName = "O'Connor-Smith",
                password = Credential.generateRandomCredentialPassword(),
            )

            // When
            userRegistrator.registerNewUser(
                email = Email(specialCharsUser.email.value),
                credential = Credential.create(specialCharsUser.credentials.first().value),
                firstName = FirstName(specialCharsUser.name?.firstName?.value ?: ""),
                lastName = LastName(specialCharsUser.name?.lastName?.value ?: ""),
            )

            // Then - Should succeed without throwing exception
            val publishedEvents = eventPublisher.getEvents()
            assertFalse(publishedEvents.isEmpty(), "Expected at least one event to be published")
        }

        @Test
        fun `should handle unicode characters in user data`(): Unit = runBlocking {
            // Given
            val unicodeUser = User.create(
                id = UUID.randomUUID().toString(),
                email = "test@example.com", // Use regular email to avoid potential unicode email issues
                firstName = "张",
                lastName = "三",
                password = Credential.generateRandomCredentialPassword(),
            )

            // When
            userRegistrator.registerNewUser(
                email = Email(unicodeUser.email.value),
                credential = Credential.create(unicodeUser.credentials.first().value),
                firstName = FirstName(unicodeUser.name?.firstName?.value ?: ""),
                lastName = LastName(unicodeUser.name?.lastName?.value ?: ""),
            )

            // Then - Should succeed without throwing exception
            val publishedEvents = eventPublisher.getEvents()
            assertFalse(publishedEvents.isEmpty(), "Expected at least one event to be published")
        }

        @Test
        fun `should handle user with empty domain events list`(): Unit = runBlocking {
            // Given
            val userCreatorMock: UserCreator = mockk()
            val mockUser: User = mockk()
            val registrator = UserRegistrator(userCreatorMock, eventPublisher)

            val testUser =
                User.create(UUID.randomUUID().toString(), email, firstname, lastname, password)
            // Create the credential once and reuse it to ensure the same object identity
            val credential = Credential.create(password)
            val emailObj = Email(testUser.email.value)
            val firstNameObj = FirstName(testUser.name?.firstName?.value ?: "")
            val lastNameObj = LastName(testUser.name?.lastName?.value ?: "")

            coEvery {
                userCreatorMock.create(
                    email = emailObj,
                    credential = credential,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )
            } returns mockUser
            every { mockUser.pullDomainEvents() } returns emptyList()

            // When
            registrator.registerNewUser(
                email = emailObj,
                credential = credential,
                firstName = firstNameObj,
                lastName = lastNameObj,
            )

            // Then - Should succeed without throwing exception
            val publishedEvents = eventPublisher.getEvents()
            assertTrue(
                publishedEvents.isEmpty(),
                "No events should be published when domain events list is empty",
            )
            coVerify(exactly = 1) {
                userCreatorMock.create(
                    email = emailObj,
                    credential = credential,
                    firstName = firstNameObj,
                    lastName = lastNameObj,
                )
            }
            verify(exactly = 1) { mockUser.pullDomainEvents() }
        }
    }
}
