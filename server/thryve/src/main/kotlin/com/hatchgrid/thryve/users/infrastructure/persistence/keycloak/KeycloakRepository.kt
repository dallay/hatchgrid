package com.hatchgrid.thryve.users.infrastructure.persistence.keycloak

import com.hatchgrid.common.domain.error.BusinessRuleValidationException
import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.credential.CredentialException
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.thryve.authentication.infrastructure.ApplicationSecurityProperties
import com.hatchgrid.thryve.users.domain.User
import com.hatchgrid.thryve.users.domain.UserCreator
import com.hatchgrid.thryve.users.domain.UserException
import com.hatchgrid.thryve.users.domain.UserStoreException
import com.hatchgrid.thryve.users.infrastructure.persistence.UserStoreR2dbcRepository
import jakarta.ws.rs.ClientErrorException
import jakarta.ws.rs.WebApplicationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.keycloak.admin.client.Keycloak
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class KeycloakRepository(
    private val applicationSecurityProperties: ApplicationSecurityProperties,
    private val keycloak: Keycloak,
    private val userStoreR2dbcRepository: UserStoreR2dbcRepository,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : UserCreator {

    private val keycloakRealm by lazy {
        keycloak.realm(applicationSecurityProperties.oauth2.realm)
    }

    /**
     * Create a new user.
     *
     * @param email The email of the user to be created.
     * @param credential The credential of the user to be created.
     * @param firstName The first name of the user to be created, nullable if not provided.
     * @param lastName The last name of the user to be created, nullable if not provided.
     * @return The created user.
     */
    override suspend fun create(
        email: Email,
        credential: Credential,
        firstName: FirstName?,
        lastName: LastName?
    ): User {
        log.debug("Creating user with email: {}", email.value)

        val message = "Error creating user with email: ${email.value}"

        return withContext(ioDispatcher) {
            try {
                val password = credential.value
                val credentialRepresentation = CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    value = password
                }

                if (checkIfUserAlreadyExists(email)) {
                    val errorMessage =
                        "User with email: ${email.value} or username: ${email.value} already exists."
                    throw UserStoreException(errorMessage.trimIndent())
                } else {
                    log.debug(
                        "Trying to create user with email: {} and username: {}",
                        email.value.replace("\n", "").replace("\r", ""),
                        email.value.replace("\n", "").replace("\r", ""),
                    )
                    val userRepresentation =
                        getUserRepresentation(email, firstName, lastName, credentialRepresentation)
                    userRepresentation.username = email.value
                    val response = keycloakRealm.users().create(userRepresentation)
                    val userId = response.location.path.replace(".*/([^/]+)$".toRegex(), "$1")

                    // Persist our local representation in users table
                    runCatching {
                        val id = java.util.UUID.fromString(userId)
                        val fullName = listOfNotNull(firstName?.value, lastName?.value)
                            .joinToString(" ").trim()
                        userStoreR2dbcRepository.create(id, email.value, fullName)
                    }.onFailure {
                        log.error("Failed to persist local user row for {}", email.value, it)
                    }

                    User.create(
                        id = userId,
                        email = email.value,
                        firstName = firstName?.value ?: "",
                        lastName = lastName?.value ?: "",
                        password = password,
                    )
                }
            } catch (exception: BusinessRuleValidationException) {
                log.error(
                    "Error creating user with email: {} and username: {}",
                    email.value.replace("\n", "").replace("\r", ""),
                    email.value.replace("\n", "").replace("\r", ""),
                    exception,
                )
                when (exception) {
                    is UserStoreException -> throw exception
                    is CredentialException -> throw UserStoreException(message, exception)
                    is UserException -> throw UserStoreException(message, exception)
                    else -> throw UserStoreException(message, exception)
                }
            } catch (exception: ClientErrorException) {
                log.error(
                    "Error creating user with email: {}",
                    email.value.replace("\n", "").replace("\r", ""),
                    exception,
                )
                throw UserStoreException(message, exception)
            }
        }
    }

    private suspend fun checkIfUserAlreadyExists(email: Email): Boolean {
        return withContext(ioDispatcher) {
            val userByEmail = getUserByEmail(email.value)
            // In the future, we might want to use a different username strategy
            val userByUsername = getUserByUsername(email.value)
            log.debug(
                "Checking if user already exists with email: {} and username: {}",
                email.value.replace("\n", "").replace("\r", ""),
                email.value.replace("\n", "").replace("\r", ""),
            )
            userByEmail != null || userByUsername != null
        }
    }

    private fun getUserRepresentation(
        email: Email,
        firstName: FirstName?,
        lastName: LastName?,
        credential: CredentialRepresentation
    ): UserRepresentation = UserRepresentation().apply {
        val emailValue = email.value
        username = emailValue
        this.email = emailValue
        this.firstName = firstName?.value ?: ""
        this.lastName = lastName?.value ?: ""
        isEnabled = true
        groups = listOf(USER_GROUP_NAME)
        credentials = listOf(credential)
    }

    private fun getUserByEmail(email: String): UserRepresentation? =
        keycloakRealm.users().searchByEmail(email, true).firstOrNull()

    private fun getUserByUsername(username: String): UserRepresentation? =
        keycloakRealm.users().searchByUsername(username, true).firstOrNull()

    suspend fun verify(userId: String) {
        log.info("Verifying user with id: {}", userId)
        try {
            withContext(ioDispatcher) {
                keycloakRealm.users()[userId].sendVerifyEmail()
            }
        } catch (_: WebApplicationException) {
            log.error("Error sending email verification to user with id: {}", userId)
        }
    }

    companion object {
        private const val USER_GROUP_NAME = "Users"
        private val log = LoggerFactory.getLogger(KeycloakRepository::class.java)
    }
}
