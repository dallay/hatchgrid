package com.hatchgrid.thryve.authentication.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.thryve.authentication.application.query.GetUserSessionQuery
import com.hatchgrid.thryve.authentication.domain.UserSession
import com.hatchgrid.thryve.authentication.domain.error.AuthenticationException
import com.hatchgrid.thryve.authentication.domain.error.InvalidTokenException
import com.hatchgrid.thryve.authentication.domain.error.MissingCookieException
import com.hatchgrid.thryve.authentication.infrastructure.cookie.AuthCookieBuilder
import com.hatchgrid.thryve.authentication.infrastructure.cookie.getCookie
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api", produces = ["application/vnd.api.v1+json"])
class SessionController(
    private val mediator: Mediator,
) {

    @Operation(summary = "Get user session information")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "OK"),
        ApiResponse(responseCode = "401", description = "Unauthorized"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/session")
    suspend fun session(request: ServerHttpRequest): ResponseEntity<UserSession> {
        log.debug("Getting user session")
        return try {
            val accessToken = request.getCookie(AuthCookieBuilder.ACCESS_TOKEN).value
            val sessionResponse = mediator.send(GetUserSessionQuery(accessToken))
            ResponseEntity.ok(sessionResponse)
        } catch (e: InvalidTokenException) {
            log.warn("Invalid token provided for session request", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        } catch (e: AuthenticationException) {
            log.warn("Authentication error during session request", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        } catch (_: NoSuchElementException) {
            log.warn("Missing access token cookie in session request")
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        } catch (e: IllegalArgumentException) {
            log.warn("Invalid request data in session request", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        } catch (e: MissingCookieException) {
            log.warn("Missing cookie in session request", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SessionController::class.java)
    }
}
