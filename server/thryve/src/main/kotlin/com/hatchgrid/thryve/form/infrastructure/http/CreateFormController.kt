package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.form.application.create.CreateFormCommand
import com.hatchgrid.thryve.form.infrastructure.http.request.CreateFormRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import java.net.URI
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * This is a REST controller for creating forms.
 * It extends the [ApiController] class and uses a [Mediator] for handling commands.
 *
 * @property mediator The [Mediator] for handling commands.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class CreateFormController(
    private val mediator: Mediator,
) : ApiController(mediator) {

    /**
     * This function handles the PUT request for creating a form.
     * It validates the request body, dispatches a [CreateFormCommand], and returns a [ResponseEntity].
     *
     * @param formId The ID of the form to create.
     * @param request The [CreateFormRequest] body containing the form data.
     * @return A [ResponseEntity] indicating the result of the operation.
     */
    @Operation(summary = "Create a form with the given data")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{workspaceId}/form/{formId}")
    suspend fun create(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable workspaceId: String,
        @Parameter(
            description = "ID of the form to be created",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable formId: String,
        @Validated @RequestBody request: CreateFormRequest
    ): ResponseEntity<String> {
        val sanitizedWorkspaceId = sanitizePathVariable(workspaceId)
        val sanitizedFormId = sanitizePathVariable(formId)
        log.debug("Creating form with id: $sanitizedFormId in workspace: $sanitizedWorkspaceId")

        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        dispatch(
            CreateFormCommand(
                formId,
                request.name,
                request.header,
                request.description,
                request.inputPlaceholder,
                request.buttonText,
                request.buttonColor,
                request.backgroundColor,
                request.textColor,
                request.buttonTextColor,
                workspaceId,
                userId,
            ),
        )
        return ResponseEntity.created(URI.create("/workspace/$sanitizedWorkspaceId/form/$sanitizedFormId")).build()
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateFormController::class.java)
    }
}
