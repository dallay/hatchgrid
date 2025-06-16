package com.hatchgrid.spring.boot

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.common.domain.bus.command.CommandHandlerExecutionError
import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.bus.query.QueryHandlerExecutionError
import com.hatchgrid.common.domain.bus.query.Response
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.apache.commons.text.StringEscapeUtils
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

/**
 * Abstract base class for API controllers.
 * Provides common functionality for handling commands, queries, and authentication.
 *
 * @property mediator The mediator used for sending commands and queries.
 */
@SecurityRequirement(name = "Keycloak")
abstract class ApiController(
    private val mediator: Mediator
) {

    /**
     * Dispatches a command using the mediator.
     *
     * @param command The command to be dispatched.
     * @throws CommandHandlerExecutionError if an error occurs while handling the command.
     */
    @Throws(CommandHandlerExecutionError::class)
    protected suspend fun dispatch(command: Command) = mediator.send(command)

    /**
     * Sends a query using the mediator and returns the response.
     *
     * @param TResponse The type of the response.
     * @param query The query to be sent.
     * @return The response from the query.
     * @throws QueryHandlerExecutionError if an error occurs while handling the query.
     */
    @Throws(QueryHandlerExecutionError::class)
    protected suspend fun <TResponse : Response> ask(query: Query<TResponse>): TResponse = mediator.send(query)

    /**
     * Retrieves the current authentication information.
     *
     * @return The current authentication, or null if not authenticated.
     */
    protected suspend fun authentication(): Authentication? {
        val authentication = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .awaitSingleOrNull()
        return authentication
    }

    /**
     * Retrieves the current user ID (from the JWT "sub" claim).
     * If the authentication is not a JwtAuthenticationToken, this method returns null,
     * as other token types like UsernamePasswordAuthenticationToken do not inherently provide
     * a JWT 'sub' claim.
     *
     * @return The current user ID (JWT "sub" claim), or null if not available.
     */
    protected suspend fun userId(): String? {
        val authentication = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .awaitSingleOrNull()

        return when (authentication) {
            is JwtAuthenticationToken -> authentication.token.subject
            // For other authentication types, a JWT 'sub' claim is not available.
            // Returning null makes the contract of this method clear: it provides the JWT subject.
            is UsernamePasswordAuthenticationToken -> null
            else -> null
        }
    }


    /**
     * Sanitizes a path variable to prevent injection attacks.
     *
     * @param pathVariable The path variable to sanitize.
     * @return The sanitized path variable.
     */
    protected fun sanitizePathVariable(pathVariable: String): String = StringEscapeUtils.escapeJava(pathVariable)

    /**
     * Sanitizes and joins multiple path variables into a single string.
     *
     * @param pathVariables The path variables to sanitize and join.
     * @return A JSON string containing the sanitized and joined path variables.
     */
    protected fun sanitizeAndJoinPathVariables(vararg pathVariables: String): String {
        val sanitizedVariables = pathVariables.map { sanitizePathVariable(it) }
        return sanitizedVariables.joinToString(" | ", prefix = "{", postfix = "}")
    }
}
