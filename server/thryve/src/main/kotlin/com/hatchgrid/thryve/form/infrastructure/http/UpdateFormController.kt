package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.form.application.update.UpdateFormCommand
import com.hatchgrid.thryve.form.infrastructure.http.request.UpdateFormRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
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
 * This is a REST controller for updating forms.
 * It extends the [ApiController] class and uses a [Mediator] for handling commands.
 *
 * @property mediator The [Mediator] for handling commands.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class UpdateFormController(
    mediator: Mediator,
) : ApiController(mediator) {

    /**
     * This function handles the PUT request for updating a form.
     * It validates the request body, dispatches an [UpdateFormCommand], and returns a [ResponseEntity].
     *
     * @param workspaceId The ID of the workspace that owns the form.
     * @param formId The ID of the form to update.
     * @param request The [UpdateFormRequest] body containing the updated form data.
     * @return A [ResponseEntity] indicating the result of the operation.
     */
    @Operation(summary = "Update a form with the given data")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Updated form"),
        ApiResponse(responseCode = "400", description = "Bad request error (validation error)"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{workspaceId}/form/{formId}/update")
    suspend fun update(
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
        @Validated @RequestBody request: UpdateFormRequest
    ): ResponseEntity<String> {
        val sanitizedWorkspaceId = sanitizePathVariable(workspaceId)
        val sanitizedFormId = sanitizePathVariable(formId)
        log.debug("Updating form with id: $sanitizedFormId in workspace: $sanitizedWorkspaceId")
        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        dispatch(
            UpdateFormCommand(
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

        return ResponseEntity.ok("Form updated successfully")
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateFormController::class.java)
    }
}
