package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.query.Response
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.form.application.details.DetailFormQuery
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Controller for fetching form details.
 *
 * @property mediator The mediator used to handle queries.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class FetchDetailFormController(
    mediator: Mediator,
) : ApiController(mediator) {

    /**
     * Fetches form details by form ID.
     *
     * @param formId The ID of the form to fetch.
     * @return The response containing form details.
     */
    @Operation(summary = "Fetch form details")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Found form"),
        ApiResponse(responseCode = "404", description = "Form not found"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/form/{formId}")
    suspend fun find(
        @Parameter(
            description = "ID of the form to be fetched",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable formId: String,
    ): Response {
        log.debug("Finding form with ids: {}", sanitizeAndJoinPathVariables(formId))
        val query = DetailFormQuery(formId)
        val response = ask(query)
        return response
    }

    companion object {
        private val log = LoggerFactory.getLogger(FetchDetailFormController::class.java)
    }
}
