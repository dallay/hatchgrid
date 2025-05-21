package com.hatchgrid.thryve.authentication.infrastructure.persistence.keycloak

import com.hatchgrid.IntegrationTest
import com.hatchgrid.thryve.authentication.domain.RefreshToken
import com.hatchgrid.thryve.authentication.domain.UserAuthenticatorLogout
import com.hatchgrid.thryve.authentication.domain.error.LogoutFailedException
import com.hatchgrid.thryve.config.InfrastructureTestContainers
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

@IntegrationTest
internal class KeycloakLogoutRepositoryIntegrationTest : InfrastructureTestContainers() {

    @Autowired
    private lateinit var userAuthenticatorLogout: UserAuthenticatorLogout

    @BeforeEach
    fun setUp() {
        startInfrastructure()
    }

    @Test
    fun logout(): Unit = runBlocking {
        val accessToken = getAccessToken()
        val refreshToken = RefreshToken(accessToken?.refreshToken ?: "fake refresh token")
        userAuthenticatorLogout.logout(refreshToken.value)
    }
    @Test
    fun `logout should handle Invalid Token`() = runBlocking {
        val invalidToken = "invalid_token"
        try {
            userAuthenticatorLogout.logout(invalidToken)
        } catch (e: Exception) {
            assert(e is LogoutFailedException) { "Could not log out user" }
        }
    }
}
