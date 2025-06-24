package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.form.application.delete.DeleteFormCommand
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * This class is a REST controller that handles HTTP requests related to form deletion.
 * It extends the ApiController class and uses the Mediator pattern for handling commands.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class DeleteFormController(
    mediator: Mediator,
) : ApiController(mediator) {

    /**
     * This function handles the DELETE HTTP request for deleting a form.
     * It uses the path variable 'id' to identify the form to be deleted.
     * The function is a suspend function, meaning it is designed to be used with Kotlin coroutines.
     * It dispatches a DeleteFormCommand with the provided id.
     *
     * @param id The id of the form to be deleted.
     * @return The result of the DeleteFormCommand dispatch.
     */
    @Operation(summary = "Delete a form")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Form deleted successfully"),
        ApiResponse(responseCode = "404", description = "Form not found"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @DeleteMapping("/workspace/{workspaceId}/form/{formId}")
    @ResponseStatus(HttpStatus.OK)
    suspend fun delete(
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
            description = "ID of the form to be deleted",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable formId: String,
    ) {
        val sanitizedWorkspaceId = sanitizePathVariable(workspaceId)
        val sanitizedFormId = sanitizePathVariable(formId)
        log.debug("Deleting form with id: $sanitizedFormId in workspace: $sanitizedWorkspaceId")
        val userId = userId() ?: throw WorkspaceAuthorizationException("User has no access to workspace")
        dispatch(DeleteFormCommand(workspaceId, formId, userId))
    }

    companion object {
        private val log = LoggerFactory.getLogger(DeleteFormController::class.java)
    }
}
