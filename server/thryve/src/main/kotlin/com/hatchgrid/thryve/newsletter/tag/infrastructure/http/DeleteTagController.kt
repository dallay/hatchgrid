package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.newsletter.tag.application.delete.DeleteTagCommand
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class DeleteTagController(
    mediator: Mediator,
) : ApiController(mediator) {
    @Operation(summary = "Delete a tag")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Tag deleted successfully"),
        ApiResponse(responseCode = "404", description = "Tag not found"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @DeleteMapping("/workspace/{workspaceId}/tag/{tagId}")
    @ResponseStatus(HttpStatus.OK)
    suspend fun delete(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        ) @PathVariable workspaceId: String,
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        )
        @PathVariable tagId: String
    ) {
        log.debug("Deleting tag with id: {}", sanitizeAndJoinPathVariables(workspaceId, tagId))

        val userId = userId() ?: throw WorkspaceAuthorizationException("User has no access to workspace $workspaceId")
        dispatch(DeleteTagCommand(workspaceId, userId, tagId))
    }

    companion object {
        private val log = LoggerFactory.getLogger(DeleteTagController::class.java)
    }
}
