package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.newsletter.tag.application.update.UpdateTagCommand
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.UpdateTagRequest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
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
 *
 * @created 22/9/24
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class UpdateTagController(
    mediator: Mediator,
) : ApiController(mediator) {
    @Operation(summary = "Update a tag")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{workspaceId}/tag/{tagId}/update")
    suspend fun update(
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
            description = "ID of the tag to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        )
        @PathVariable tagId: String,
        @Validated @RequestBody request: UpdateTagRequest
    ): ResponseEntity<String> {
        log.debug(
            "Updating tag with data: {}",
            sanitizeAndJoinPathVariables(workspaceId, tagId, request.toString()),
        )
        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        dispatch(
            UpdateTagCommand(
                tagId,
                request.name,
                request.color,
                workspaceId,
                userId,
                request.subscribers,
            ),
        )
        return ResponseEntity.ok("Tag updated")
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateTagController::class.java)
    }
}
