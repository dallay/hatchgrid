package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.newsletter.tag.application.create.CreateTagCommand
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.CreateTagRequest
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
 * REST controller for handling requests to create a new tag.
 *
 * @property mediator The mediator for dispatching commands.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class CreateTagController(
    mediator: Mediator,
) : ApiController(mediator) {

    /**
     * Creates a new tag.
     *
     * @param tagId The unique identifier of the tag.
     * @param request The request containing the tag details.
     * @return A ResponseEntity indicating the result of the operation.
     */
    @Operation(summary = "Create a new tag")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{workspaceId}/tag/{tagId}")
    suspend fun create(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @PathVariable
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        ) workspaceId: String,
        @Parameter(
            description = "ID of the tag to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable tagId: String,
        @Validated @RequestBody request: CreateTagRequest
    ): ResponseEntity<String> {
        log.debug(
            "Creating tag with data: {}",
            sanitizeAndJoinPathVariables(workspaceId, tagId),
        )

        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        dispatch(
            CreateTagCommand(
                tagId,
                request.name,
                request.color ?: TagColor.DEFAULT.value,
                workspaceId,
                userId,
                request.subscribers,
            ),
        )
        val sanitizedWorkspaceId = sanitizePathVariable(workspaceId)
        val sanitizedTagId = sanitizePathVariable(tagId)
        return ResponseEntity.created(
            URI.create("/workspace/$sanitizedWorkspaceId/tag/$sanitizedTagId"),
        ).build()
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateTagController::class.java)
    }
}
